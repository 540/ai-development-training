#!/usr/bin/env node
// Deterministic gates of the review: pnpm check, duplication, coverage -> CRAP, and Stryker scoped
// to the domain/services files the diff touches. Prints ONE JSON object on stdout and writes the
// same object to .claude/tmp/gates/result.json. Usage: node gates.mjs [--base <branch>]
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const argv = process.argv.slice(2)
const baseIdx = argv.indexOf('--base')
const BASE = baseIdx >= 0 ? argv[baseIdx + 1] : 'harness'
const ROOT = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const OUT = join(ROOT, '.claude/tmp/gates')
const MUTATION_REPORT = join(ROOT, 'reports/mutation/mutation.json')
const MUTABLE = /^src\/core\/[^/]+\/(domain|services)\/(?!.*__tests__\/).*\.ts$/

mkdirSync(OUT, { recursive: true })

const git = (...args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' })
const lines = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean)

const baseRef = git('rev-parse', '--verify', '--quiet', BASE).status === 0 ? BASE : 'origin/' + BASE
const mergeBase = git('merge-base', baseRef, 'HEAD').stdout.trim()
const changedFiles = [
  ...new Set([
    ...lines(git('diff', '--name-only', '--diff-filter=ACMR', mergeBase).stdout),
    ...lines(git('ls-files', '--others', '--exclude-standard').stdout),
  ]),
].filter((f) => !f.startsWith('.claude/'))
const mutateFiles = changedFiles.filter((f) => MUTABLE.test(f) && existsSync(join(ROOT, f)))

const tail = (text, n = 40) => text.split('\n').slice(-n).join('\n').trim()

const run = (name, command) =>
  new Promise((resolve) => {
    const child = spawn(command, { cwd: ROOT, shell: true, env: { ...process.env, FORCE_COLOR: '0', CI: '1' } })
    let output = ''
    child.stdout.on('data', (d) => (output += d))
    child.stderr.on('data', (d) => (output += d))
    child.on('close', (code) => {
      const log = join(OUT, name + '.log')
      writeFileSync(log, output)
      resolve({ name, ok: code === 0, log: '.claude/tmp/gates/' + name + '.log', tail: code === 0 ? '' : tail(output) })
    })
  })

const survivorsFrom = (report) =>
  Object.entries(report.files || {}).flatMap(([file, { mutants = [] }]) =>
    mutants
      .filter((m) => m.status === 'Survived' || m.status === 'NoCoverage')
      .map((m) => ({
        file,
        line: m.location && m.location.start ? m.location.start.line : null,
        mutator: m.mutatorName,
        replacement: m.replacement || '',
        status: m.status,
      })),
  )

const mutation = async () => {
  if (mutateFiles.length === 0) return { name: 'mutation', ok: true, skipped: true, files: [], survivors: [], log: '', tail: '' }
  const result = await run('mutation', 'pnpm exec stryker run --reporters json,clear-text --mutate ' + mutateFiles.join(','))
  const survivors = existsSync(MUTATION_REPORT) ? survivorsFrom(JSON.parse(readFileSync(MUTATION_REPORT, 'utf8'))) : []
  return { ...result, ok: result.ok && survivors.length === 0, skipped: false, files: mutateFiles, survivors }
}

const [check, duplication, coverageAndCrap, mutationResult] = await Promise.all([
  run('check', 'pnpm check'),
  run('duplication', 'pnpm duplication'),
  run('coverage', 'pnpm coverage').then(async (coverage) => [coverage, coverage.ok ? await run('crap', 'pnpm crap') : { name: 'crap', ok: false, log: '', tail: 'not run: coverage failed' }]),
  mutation(),
])

const gates = [check, duplication, ...coverageAndCrap, mutationResult]
const result = { base: BASE, mergeBase, changedFiles, green: gates.every((g) => g.ok), gates }

writeFileSync(join(OUT, 'result.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result))
process.exit(0)
