import { describe, expect, it } from 'vitest'
import {
  CRAP_THRESHOLD,
  crapGate,
  crapOf,
  risksOf,
  type CoverageReport,
  type FileCoverage,
  type Range,
} from '../crap'

type FunctionSpec = {
  name: string
  from: number
  to: number
  decisions?: number
  statements?: number
  covered?: number
}

function span(line: number): Range {
  return { start: { line, column: 0 }, end: { line, column: null } }
}

function fileWith(
  path: string,
  specs: FunctionSpec[],
  strayStatementLine?: number,
): FileCoverage {
  const statementMap: FileCoverage['statementMap'] = {}
  const s: FileCoverage['s'] = {}
  const branchMap: FileCoverage['branchMap'] = {}
  const fnMap: FileCoverage['fnMap'] = {}

  specs.forEach((spec, index) => {
    const statements = spec.statements ?? 1
    const covered = spec.covered ?? statements

    fnMap[String(index)] = {
      name: spec.name,
      decl: { start: { line: spec.from, column: 9 }, end: { line: spec.from, column: 20 } },
      loc: { start: { line: spec.from, column: 0 }, end: { line: spec.to, column: null } },
    }

    for (let statement = 0; statement < statements; statement += 1) {
      const id = `${index}-${statement}`
      statementMap[id] = span(spec.from + 1 + statement)
      s[id] = statement < covered ? 1 : 0
    }

    for (let decision = 0; decision < (spec.decisions ?? 0); decision += 1) {
      const line = spec.from + 1 + decision
      branchMap[`${index}-${decision}`] = { loc: span(line), locations: [span(line), span(line)] }
    }
  })

  if (strayStatementLine !== undefined) {
    statementMap['stray'] = span(strayStatementLine)
    s['stray'] = 1
  }

  return { path, statementMap, s, branchMap, fnMap }
}

function reportWith(...files: FileCoverage[]): CoverageReport {
  return Object.fromEntries(files.map((file) => [file.path, file]))
}

const simple = (spec: Partial<FunctionSpec> = {}) =>
  fileWith('src/domain/probe.ts', [{ name: 'probed', from: 1, to: 100, ...spec }])

describe('the CRAP formula', () => {
  it.each([
    { cc: 1, cov: 1, crap: 1, verdict: 'pass' },
    { cc: 5, cov: 1, crap: 5, verdict: 'pass' },
    { cc: 8, cov: 1, crap: 8, verdict: 'pass' },
    { cc: 9, cov: 1, crap: 9, verdict: 'fail' },
    { cc: 2, cov: 0, crap: 6, verdict: 'pass' },
    { cc: 3, cov: 0.5, crap: 4.125, verdict: 'pass' },
    { cc: 5, cov: 0.5, crap: 8.125, verdict: 'fail' },
    { cc: 4, cov: 0, crap: 20, verdict: 'fail' },
    { cc: 3, cov: 0, crap: 12, verdict: 'fail' },
  ])('complexity $cc and coverage $cov give $crap and $verdict', ({ cc, cov, crap, verdict }) => {
    expect(crapOf(cc, cov)).toBeCloseTo(crap, 10)
    expect(crapOf(cc, cov) > CRAP_THRESHOLD ? 'fail' : 'pass').toBe(verdict)
  })

  it('lets a simple untested function pass: it punishes the combination, not the absence', () => {
    expect(crapOf(1, 0)).toBe(2)
    expect(crapGate(reportWith(simple({ statements: 2, covered: 0 }))).exitCode).toBe(0)
  })
})

describe('reading the coverage report', () => {
  it('crosses the complexity of each function with its statement coverage', () => {
    expect(risksOf(reportWith(simple({ decisions: 2, statements: 4, covered: 2 })))).toEqual([
      {
        file: 'src/domain/probe.ts',
        name: 'probed',
        line: 1,
        complexity: 3,
        coverage: 0.5,
        crap: 4.125,
      },
    ])
  })

  it('assigns each statement to the innermost function that contains it', () => {
    const nested = fileWith('src/domain/nested.ts', [
      { name: 'outer', from: 1, to: 100, statements: 2, covered: 2 },
      { name: 'inner', from: 10, to: 20, decisions: 1, statements: 2, covered: 0 },
    ])

    expect(risksOf(reportWith(nested))).toEqual([
      expect.objectContaining({ name: 'outer', complexity: 1, coverage: 1 }),
      expect.objectContaining({ name: 'inner', complexity: 2, coverage: 0 }),
    ])
  })

  it('ignores decisions that live outside every function', () => {
    const withLooseDecision = fileWith('src/domain/loose.ts', [
      { name: 'probed', from: 10, to: 20, statements: 1, covered: 1 },
    ])
    withLooseDecision.branchMap['loose'] = {
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: null } },
      locations: [
        { start: { line: 1, column: 0 }, end: { line: 1, column: null } },
        { start: { line: 1, column: 0 }, end: { line: 1, column: null } },
      ],
    }

    expect(risksOf(reportWith(withLooseDecision))).toEqual([
      expect.objectContaining({ name: 'probed', complexity: 1 }),
    ])
  })

  it('ignores statements that live outside every function', () => {
    const withLooseStatement = fileWith(
      'src/domain/loose.ts',
      [{ name: 'probed', from: 10, to: 20, statements: 1, covered: 1 }],
      1,
    )

    expect(risksOf(reportWith(withLooseStatement))).toEqual([
      expect.objectContaining({ name: 'probed', coverage: 1 }),
    ])
  })

  it('counts a function without statements as covered', () => {
    expect(risksOf(reportWith(simple({ statements: 0 })))).toEqual([
      expect.objectContaining({ coverage: 1, crap: 1 }),
    ])
  })

  it('tells apart functions that start and end on the same line by their column', () => {
    const inline: FileCoverage = {
      path: 'src/domain/inline.ts',
      statementMap: {
        '0': { start: { line: 10, column: 30 }, end: { line: 10, column: 44 } },
      },
      s: { '0': 0 },
      branchMap: {},
      fnMap: {
        '0': {
          name: 'inner',
          decl: { start: { line: 10, column: 20 }, end: { line: 10, column: 25 } },
          loc: { start: { line: 10, column: 20 }, end: { line: 10, column: 50 } },
        },
        '1': {
          name: 'outer',
          decl: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
          loc: { start: { line: 10, column: 0 }, end: { line: 10, column: null } },
        },
      },
    }

    expect(risksOf(reportWith(inline))).toEqual([
      expect.objectContaining({ name: 'inner', coverage: 0 }),
      expect.objectContaining({ name: 'outer', coverage: 1 }),
    ])
  })

  it('does not analyze test files', () => {
    const test = fileWith('tests/core/probe.test.ts', [
      { name: 'tangled', from: 1, to: 100, decisions: 8, statements: 2, covered: 0 },
    ])

    expect(risksOf(reportWith(test))).toEqual([])
  })
})

describe('the CRAP gate', () => {
  it('exits with 0 when no function goes over the threshold', () => {
    expect(crapGate(reportWith(simple({ decisions: 7 })))).toEqual({
      exitCode: 0,
      message: 'No function goes over CRAP 8.',
    })
  })

  it('exits with 1 naming the file, complexity, coverage and CRAP of each function', () => {
    const result = crapGate(reportWith(simple({ decisions: 4, statements: 2, covered: 1 })))

    expect(result.exitCode).toBe(1)
    expect(result.message).toContain('src/domain/probe.ts:1 probed')
    expect(result.message).toContain('complexity 5')
    expect(result.message).toContain('coverage 50%')
    expect(result.message).toContain('CRAP 8.13')
  })

  it('lists the riskiest function first', () => {
    const riskyFunctions = fileWith('src/domain/risky.ts', [
      { name: 'lower', from: 1, to: 50, decisions: 4, statements: 2, covered: 1 },
      { name: 'higher', from: 60, to: 100, decisions: 3, statements: 2, covered: 0 },
    ])

    const names = crapGate(reportWith(riskyFunctions))
      .message.split('\n')
      .slice(1)
      .map((line) => line.trim().split(' ')[1])

    expect(names).toEqual(['higher', 'lower'])
  })

  it('exits with 1 when there is no coverage report', () => {
    expect(crapGate(null)).toEqual({
      exitCode: 1,
      message: 'There is no coverage report: run the coverage before the CRAP gate.',
    })
  })
})
