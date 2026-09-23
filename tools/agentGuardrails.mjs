import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

const CHECKED = /^src\/.*\.(tsx?|css)$/
const CODE = /\.tsx?$/
const STYLES = /\.css$/
const PATH_KEYS = ['file_path', 'filePath', 'path', 'TargetFile', 'targetFile']
const PATCH_FILE = /^\*\*\* (?:Add|Update) File: (.+)$/gm
const MAX_RETRIES = 3

const [mode = 'edit', tool = 'claude'] = process.argv.slice(2)
const isWindows = process.platform === 'win32'

const gitRoot = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout?.trim()
const root = gitRoot || process.cwd()

const parseJson = (text) => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const readPayload = () => parseJson(readFileSync(0, 'utf8')) ?? {}

const collectPaths = (node, found = new Set()) => {
  if (typeof node === 'string') {
    for (const match of node.matchAll(PATCH_FILE)) found.add(match[1].trim())
    const nested = node.trim().startsWith('{') ? parseJson(node) : null
    if (nested) collectPaths(nested, found)
  } else if (Array.isArray(node)) {
    node.forEach((item) => collectPaths(item, found))
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (PATH_KEYS.includes(key) && typeof value === 'string') found.add(value)
      else collectPaths(value, found)
    }
  }
  return found
}

const fromRoot = (path) => relative(root, isAbsolute(path) ? path : resolve(root, path)).split('\\').join('/')

const run = (command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', shell: isWindows })
  return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() }
}

const lastLines = (text) => text.split('\n').slice(-40).join('\n')

const checkFile = (path) =>
  [
    CODE.test(path) && ['eslint', path],
    STYLES.test(path) && ['stylelint', path],
    ['cspell', '--no-progress', '--no-summary', path],
  ]
    .filter(Boolean)
    .map((args) => run('pnpm', ['exec', ...args]))
    .filter(({ ok }) => !ok)
    .map(({ output }) => output)

const editFailures = (payload) => {
  const paths = [...collectPaths(payload.tool_input ?? payload.toolArgs ?? payload.toolCall ?? payload)]
    .map(fromRoot)
    .filter((path) => CHECKED.test(path))
  const failures = [...new Set(paths)].flatMap(checkFile)
  return failures.length > 0 ? `${paths.join(', ')} breaks the project guardrails. Fix it:\n${lastLines(failures.join('\n'))}` : ''
}

const isRetryingStop = (payload) =>
  payload.stop_hook_active === true ||
  (payload.loop_count ?? 0) >= MAX_RETRIES ||
  (payload.executionNum ?? 0) > MAX_RETRIES ||
  (payload.status !== undefined && payload.status !== 'completed')

const stopFailures = (payload) => {
  if (isRetryingStop(payload)) return ''
  const { ok, output } = run('pnpm', ['check'])
  return ok ? '' : `pnpm check is failing. Fix it before finishing the task:\n${lastLines(output)}`
}

const block = (message) => {
  console.error(message)
  process.exit(2)
}

const answer = (json) => {
  console.log(JSON.stringify(json))
  process.exit(0)
}

const REPLIES = {
  claude: (message) => block(message),
  codex: (message) => block(message),
  copilot: (message) => block(message),
  cursor: (message) => answer(mode === 'stop' ? { followup_message: message } : { additional_context: message }),
  antigravity: (message) => (mode === 'stop' ? answer({ decision: 'continue', reason: message }) : process.exit(0)),
}

const runsTwiceInCursor = tool === 'claude' && process.env.CURSOR_PROJECT_DIR

if (runsTwiceInCursor) process.exit(0)

const payload = readPayload()
const message = mode === 'stop' ? stopFailures(payload) : editFailures(payload)

if (message) (REPLIES[tool] ?? REPLIES.claude)(message)
