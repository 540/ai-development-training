export const CRAP_THRESHOLD = 8

export type Position = { line: number; column: number | null }
export type Range = { start: Position; end: Position }

export type FileCoverage = {
  path: string
  statementMap: Record<string, Range>
  fnMap: Record<string, { name: string; decl: Range; loc: Range }>
  branchMap: Record<string, { loc: Range; locations: Range[] }>
  s: Record<string, number>
}

export type CoverageReport = Record<string, FileCoverage>

export type FunctionRisk = {
  file: string
  name: string
  line: number
  complexity: number
  coverage: number
  crap: number
}

export type GateResult = {
  exitCode: number
  message: string
}

export function crapOf(complexity: number, coverage: number): number {
  return complexity ** 2 * (1 - coverage) ** 3 + complexity
}

function columnOf(position: Position): number {
  return position.column ?? Number.POSITIVE_INFINITY
}

function isBefore(one: Position, other: Position): boolean {
  if (one.line !== other.line) {
    return one.line < other.line
  }
  return columnOf(one) <= columnOf(other)
}

function contains(range: Range, position: Position): boolean {
  return isBefore(range.start, position) && isBefore(position, range.end)
}

function isNarrower(one: Range, other: Range): boolean {
  const oneLines = one.end.line - one.start.line
  const otherLines = other.end.line - other.start.line

  if (oneLines !== otherLines) {
    return oneLines < otherLines
  }

  return columnOf(one.end) < columnOf(other.end)
}

function innermostFunctionAt(
  functions: Array<{ id: string; loc: Range }>,
  position: Position,
): string | null {
  const enclosing = functions.filter((candidate) => contains(candidate.loc, position))

  if (enclosing.length === 0) {
    return null
  }

  return enclosing.reduce((narrowest, candidate) =>
    isNarrower(candidate.loc, narrowest.loc) ? candidate : narrowest,
  ).id
}

function isTestFile(path: string): boolean {
  return path.includes('/tests/') || /\.test\.[cm]?[jt]sx?$/.test(path)
}

function risksOfFile(file: FileCoverage): FunctionRisk[] {
  const functions = Object.entries(file.fnMap).map(([id, entry]) => ({ id, loc: entry.loc }))

  const statements = new Map<string, { total: number; covered: number }>()
  const decisions = new Map<string, number>()

  for (const [id, range] of Object.entries(file.statementMap)) {
    const owner = innermostFunctionAt(functions, range.start)

    if (owner !== null) {
      const tally = statements.get(owner) ?? { total: 0, covered: 0 }
      tally.total += 1
      tally.covered += file.s[id]! > 0 ? 1 : 0
      statements.set(owner, tally)
    }
  }

  for (const branch of Object.values(file.branchMap)) {
    const owner = innermostFunctionAt(functions, branch.loc.start)

    if (owner !== null) {
      decisions.set(owner, (decisions.get(owner) ?? 0) + branch.locations.length - 1)
    }
  }

  return Object.entries(file.fnMap).map(([id, entry]) => {
    const tally = statements.get(id) ?? { total: 0, covered: 0 }
    const coverage = tally.total === 0 ? 1 : tally.covered / tally.total
    const complexity = 1 + (decisions.get(id) ?? 0)

    return {
      file: file.path,
      name: entry.name,
      line: entry.decl.start.line,
      complexity,
      coverage,
      crap: crapOf(complexity, coverage),
    }
  })
}

export function risksOf(report: CoverageReport): FunctionRisk[] {
  return Object.values(report)
    .filter((file) => !isTestFile(file.path))
    .flatMap(risksOfFile)
}

function describe(risk: FunctionRisk): string {
  const coverage = `${(risk.coverage * 100).toFixed(0)}%`

  return `  ${risk.file}:${risk.line} ${risk.name} — complexity ${risk.complexity}, coverage ${coverage}, CRAP ${risk.crap.toFixed(2)}`
}

export function crapGate(report: CoverageReport | null): GateResult {
  if (report === null) {
    return {
      exitCode: 1,
      message: 'There is no coverage report: run the coverage before the CRAP gate.',
    }
  }

  const failures = risksOf(report).filter((risk) => risk.crap > CRAP_THRESHOLD)

  if (failures.length === 0) {
    return { exitCode: 0, message: `No function goes over CRAP ${CRAP_THRESHOLD}.` }
  }

  const lines = failures
    .sort((one, other) => other.crap - one.crap)
    .map(describe)
    .join('\n')

  return {
    exitCode: 1,
    message: `These functions go over CRAP ${CRAP_THRESHOLD}:\n${lines}`,
  }
}
