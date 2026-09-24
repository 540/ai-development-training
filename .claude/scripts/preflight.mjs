#!/usr/bin/env node
// Preflight of the implement workflow: everything the later phases need, checked before any edit.
// Prints ONE JSON object: { blockers: string[], checks: [{ name, ok, detail }] }.
// Usage: node preflight.mjs --base <branch> --branch <feature-branch> [--skip-browser]
import { spawnSync } from 'node:child_process'

const argv = process.argv.slice(2)
const flag = (name) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : ''
}
const BASE = flag('--base') || 'harness'
const BRANCH = flag('--branch')
const SKIP_BROWSER = argv.includes('--skip-browser')

const sh = (command) => {
  const r = spawnSync(command, { shell: true, encoding: 'utf8', env: { ...process.env, FORCE_COLOR: '0' } })
  const output = ((r.stdout || '') + (r.stderr || '')).trim()
  return { ok: r.status === 0, output: output.split('\n').slice(-15).join('\n') }
}

const checks = []
const check = (name, ok, detail, blocker) => checks.push({ name, ok, detail, blocker: ok ? '' : blocker })

const fetched = sh('git fetch origin ' + BASE + ' --quiet')
check('fetch-base', fetched.ok, fetched.output, 'cannot fetch origin/' + BASE + ': ' + fetched.output)

const unpushed = sh('git rev-list --count origin/' + BASE + '..' + BASE).output
check('base-pushed', unpushed === '0', unpushed + ' local commit(s) on ' + BASE + ' not in origin/' + BASE, BASE + ' has ' + unpushed + ' unpushed commit(s): the PR would carry them. Push ' + BASE + ' first.')

const behind = sh('git rev-list --count ' + BASE + '..origin/' + BASE).output
check('base-up-to-date', behind === '0', BASE + ' is ' + behind + ' commit(s) behind origin/' + BASE, BASE + ' is ' + behind + ' commit(s) behind origin/' + BASE + '. Pull it first.')

const head = sh('git branch --show-current').output
check('on-feature-branch', !!BRANCH && head === BRANCH, 'HEAD on ' + head, 'HEAD is on "' + head + '", expected "' + BRANCH + '"')

const auth = sh('gh auth status')
check('gh-auth', auth.ok, auth.output, 'gh is not authenticated: run `gh auth login`')

const prList = sh('gh pr list --limit 1')
check('gh-pr', prList.ok, prList.output, 'gh cannot list PRs of this repo: ' + prList.output)

// Dry-run push to prove write access; --no-verify only because a dry run publishes nothing
// and the real push in the PR phase runs the pre-push hook.
const push = sh('git push --dry-run --no-verify origin HEAD:refs/heads/' + BRANCH)
check('push-access', push.ok, push.output, 'cannot push to origin: ' + push.output)

if (!SKIP_BROWSER) {
  const browser = sh('pnpm exec playwright install chromium')
  check('playwright-chromium', browser.ok, browser.output, 'cannot install the Playwright Chromium: ' + browser.output)
}

const baseline = sh('pnpm check')
check('baseline-check', baseline.ok, baseline.ok ? 'pnpm check green before any edit' : baseline.output, 'pnpm check is already red on ' + BASE + ' before any edit: ' + baseline.output)

console.log(JSON.stringify({ blockers: checks.filter((c) => !c.ok).map((c) => c.blocker), checks: checks.map(({ name, ok, detail }) => ({ name, ok, detail })) }))
