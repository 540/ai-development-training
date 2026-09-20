import { describe, expect, it } from 'vitest'
import {
  CRAP_THRESHOLD,
  crapGate,
  crapOf,
  risksOf,
  type CoverageReport,
  type FileCoverage,
  type Range,
} from '../../tools/crap/crap'

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
  fileWith('src/domain/probe.ts', [{ name: 'analizada', from: 1, to: 100, ...spec }])

describe('el cálculo de CRAP', () => {
  it.each([
    { cc: 1, cov: 1, crap: 1, verdict: 'pasa' },
    { cc: 5, cov: 1, crap: 5, verdict: 'pasa' },
    { cc: 8, cov: 1, crap: 8, verdict: 'pasa' },
    { cc: 9, cov: 1, crap: 9, verdict: 'falla' },
    { cc: 2, cov: 0, crap: 6, verdict: 'pasa' },
    { cc: 3, cov: 0.5, crap: 4.125, verdict: 'pasa' },
    { cc: 5, cov: 0.5, crap: 8.125, verdict: 'falla' },
    { cc: 4, cov: 0, crap: 20, verdict: 'falla' },
    { cc: 3, cov: 0, crap: 12, verdict: 'falla' },
  ])('con complejidad $cc y cobertura $cov da $crap y $verdict', ({ cc, cov, crap, verdict }) => {
    expect(crapOf(cc, cov)).toBeCloseTo(crap, 10)
    expect(crapOf(cc, cov) > CRAP_THRESHOLD ? 'falla' : 'pasa').toBe(verdict)
  })

  it('deja pasar una función simple sin ningún test: castiga la combinación, no la ausencia', () => {
    expect(crapOf(1, 0)).toBe(2)
    expect(crapGate(reportWith(simple({ statements: 2, covered: 0 }))).exitCode).toBe(0)
  })
})

describe('la lectura del informe de cobertura', () => {
  it('cruza la complejidad de cada función con su cobertura de sentencias', () => {
    expect(risksOf(reportWith(simple({ decisions: 2, statements: 4, covered: 2 })))).toEqual([
      {
        file: 'src/domain/probe.ts',
        name: 'analizada',
        line: 1,
        complexity: 3,
        coverage: 0.5,
        crap: 4.125,
      },
    ])
  })

  it('atribuye cada sentencia a la función más interna que la contiene', () => {
    const anidada = fileWith('src/domain/anidada.ts', [
      { name: 'fuera', from: 1, to: 100, statements: 2, covered: 2 },
      { name: 'dentro', from: 10, to: 20, decisions: 1, statements: 2, covered: 0 },
    ])

    expect(risksOf(reportWith(anidada))).toEqual([
      expect.objectContaining({ name: 'fuera', complexity: 1, coverage: 1 }),
      expect.objectContaining({ name: 'dentro', complexity: 2, coverage: 0 }),
    ])
  })

  it('ignora las decisiones que no viven dentro de ninguna función', () => {
    const conDecisionSuelta = fileWith('src/domain/suelta.ts', [
      { name: 'analizada', from: 10, to: 20, statements: 1, covered: 1 },
    ])
    conDecisionSuelta.branchMap['suelta'] = {
      loc: { start: { line: 1, column: 0 }, end: { line: 1, column: null } },
      locations: [
        { start: { line: 1, column: 0 }, end: { line: 1, column: null } },
        { start: { line: 1, column: 0 }, end: { line: 1, column: null } },
      ],
    }

    expect(risksOf(reportWith(conDecisionSuelta))).toEqual([
      expect.objectContaining({ name: 'analizada', complexity: 1 }),
    ])
  })

  it('ignora las sentencias que no viven dentro de ninguna función', () => {
    const conSuelta = fileWith(
      'src/domain/suelta.ts',
      [{ name: 'analizada', from: 10, to: 20, statements: 1, covered: 1 }],
      1,
    )

    expect(risksOf(reportWith(conSuelta))).toEqual([
      expect.objectContaining({ name: 'analizada', coverage: 1 }),
    ])
  })

  it('cuenta una función sin sentencias como cubierta', () => {
    expect(risksOf(reportWith(simple({ statements: 0 })))).toEqual([
      expect.objectContaining({ coverage: 1, crap: 1 }),
    ])
  })

  it('distingue funciones que empiezan y acaban en la misma línea por su columna', () => {
    const enLinea: FileCoverage = {
      path: 'src/domain/en-linea.ts',
      statementMap: {
        '0': { start: { line: 10, column: 30 }, end: { line: 10, column: 44 } },
      },
      s: { '0': 0 },
      branchMap: {},
      fnMap: {
        '0': {
          name: 'dentro',
          decl: { start: { line: 10, column: 20 }, end: { line: 10, column: 25 } },
          loc: { start: { line: 10, column: 20 }, end: { line: 10, column: 50 } },
        },
        '1': {
          name: 'fuera',
          decl: { start: { line: 10, column: 0 }, end: { line: 10, column: 5 } },
          loc: { start: { line: 10, column: 0 }, end: { line: 10, column: null } },
        },
      },
    }

    expect(risksOf(reportWith(enLinea))).toEqual([
      expect.objectContaining({ name: 'dentro', coverage: 0 }),
      expect.objectContaining({ name: 'fuera', coverage: 1 }),
    ])
  })

  it('no analiza los ficheros de test', () => {
    const test = fileWith('tests/core/probe.test.ts', [
      { name: 'enredada', from: 1, to: 100, decisions: 8, statements: 2, covered: 0 },
    ])

    expect(risksOf(reportWith(test))).toEqual([])
  })
})

describe('el gate de CRAP', () => {
  it('sale en 0 cuando ninguna función supera el umbral', () => {
    expect(crapGate(reportWith(simple({ decisions: 7 })))).toEqual({
      exitCode: 0,
      message: 'Ninguna función supera el CRAP 8.',
    })
  })

  it('sale en 1 nombrando fichero, complejidad, cobertura y CRAP de cada función', () => {
    const result = crapGate(reportWith(simple({ decisions: 4, statements: 2, covered: 1 })))

    expect(result.exitCode).toBe(1)
    expect(result.message).toContain('src/domain/probe.ts:1 analizada')
    expect(result.message).toContain('complejidad 5')
    expect(result.message).toContain('cobertura 50%')
    expect(result.message).toContain('CRAP 8.13')
  })

  it('lista primero la función más arriesgada', () => {
    const arriesgadas = fileWith('src/domain/arriesgadas.ts', [
      { name: 'menos', from: 1, to: 50, decisions: 4, statements: 2, covered: 1 },
      { name: 'mas', from: 60, to: 100, decisions: 3, statements: 2, covered: 0 },
    ])

    const nombres = crapGate(reportWith(arriesgadas))
      .message.split('\n')
      .slice(1)
      .map((line) => line.trim().split(' ')[1])

    expect(nombres).toEqual(['mas', 'menos'])
  })

  it('sale en 1 cuando no existe informe de cobertura', () => {
    expect(crapGate(null)).toEqual({
      exitCode: 1,
      message: 'No hay informe de cobertura: ejecuta la cobertura antes que el gate de CRAP.',
    })
  })
})
