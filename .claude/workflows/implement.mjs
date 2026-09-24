export const meta = {
  name: 'implement',
  description:
    'Lleva una tarea de la Pokédex (texto libre o fichero de spec) hasta una PR en borrador contra harness: analiza y planifica, revisa el plan, crea la rama de feature, ejecuta un preflight determinista (acceso a git/gh, Chromium y pnpm check en verde de partida), implementa con tests, hace un bucle acotado de revisión (gates deterministas — pnpm check, duplicación, cobertura, CRAP y Stryker acotado al diff — más revisión puntuada con la skill review-pr y triaje por hallazgo; desde la ronda 2 solo los críticos y los gates en rojo compran otra vuelta) con salida en Merge Safety >= minScore y gates en verde, verifica en Chromium con Playwright y PokéAPI mockeada cuando hay UI visible, y abre la PR con salvedades y capturas. Totalmente autónomo.',
  whenToUse:
    'Lánzalo con args = { task: "..." } o args = { specFile: "specs/x.md" } (uno de los dos es obligatorio; si llegan los dos, manda la spec y task añade contexto). Opcionales: baseBranch (por defecto "harness"), maxRounds (rondas de revisión y verificación, por defecto 3), minScore (Merge Safety mínima, por defecto 8.5), skipBrowser (true para saltarse Verify), skipPr (true para parar antes del push), model y effort (sobrescriben todos los tiers a la vez).',
  phases: [
    { title: 'Analyze' },
    { title: 'Plan review' },
    { title: 'Branch' },
    { title: 'Preflight' },
    { title: 'Implement' },
    { title: 'Review' },
    { title: 'Verify' },
    { title: 'PR' },
  ],
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------
// `args` may arrive already parsed or as a JSON string (scriptPath launches serialize it).
const ARGS = typeof args === 'string' ? (args ? JSON.parse(args) : {}) : args || {}
const TASK = typeof ARGS.task === 'string' ? ARGS.task.trim() : ''
const SPEC_FILE = typeof ARGS.specFile === 'string' ? ARGS.specFile.trim() : ''
if (!TASK && !SPEC_FILE) throw new Error('implement necesita args.task o args.specFile (p. ej. { task: "Añadir vista de efectividad de tipos" })')

const BASE = typeof ARGS.baseBranch === 'string' && ARGS.baseBranch ? ARGS.baseBranch : 'harness'
const MAX_ROUNDS = Number.isInteger(ARGS.maxRounds) && ARGS.maxRounds >= 1 ? ARGS.maxRounds : 3
const MIN_SCORE = typeof ARGS.minScore === 'number' && ARGS.minScore >= 0 && ARGS.minScore <= 10 ? ARGS.minScore : 8.5
const SKIP_BROWSER = ARGS.skipBrowser === true
const SKIP_PR = ARGS.skipPr === true

const TIERS = {
  command: { model: 'haiku' }, // runs one deterministic script and hands back its stdout
  mechanical: { model: 'sonnet', effort: 'low' },
  standard: { model: 'sonnet', effort: 'medium' },
  deep: { model: 'opus', effort: 'medium' },
}
const MODEL_OVERRIDE = typeof ARGS.model === 'string' ? ARGS.model : ''
const EFFORT_OVERRIDE = typeof ARGS.effort === 'string' ? ARGS.effort : ''
const tier = (name) => {
  const t = { model: MODEL_OVERRIDE || TIERS[name].model }
  const effort = EFFORT_OVERRIDE || TIERS[name].effort
  return effort ? { ...t, effort } : t
}

const GATES_CMD = 'node .claude/skills/review-pr/scripts/gates.mjs --base ' + BASE
const PREFLIGHT_CMD = 'node .claude/scripts/preflight.mjs --base ' + BASE
// Gates the pre-push hook (pnpm verify) also enforces: if any is red, the push would be refused.
const PUSH_GATES = ['check', 'duplication', 'coverage', 'crap']
const WEIGHTS = { correctness: 0.3, architecture: 0.2, domain: 0.2, tests: 0.2, ui: 0.1 }
const RED_GATE_CAP = 5

const TASK_TEXT = [
  SPEC_FILE && 'Spec de la tarea: ' + SPEC_FILE + ' (léela entera; manda sobre el texto libre).',
  TASK && (SPEC_FILE ? 'Contexto adicional: ' : 'Tarea: ') + TASK,
].filter(Boolean).join('\n')

// Shared context embedded in every agent (each agent starts from a fresh context).
const SHARED = [
  'Proyecto: Pokédex en React + TypeScript + Vite sobre PokéAPI. Rama base: ' + BASE + '.',
  TASK_TEXT,
  'NUNCA metas en stage ni commitees .claude/, CLAUDE.md ni CLAUDE.local.md.',
  'NUNCA reescribas la historia (ni amend, ni rebase, ni reset, ni push --force): puede haber checkpoints ya publicados. Se arregla hacia delante, con otro commit.',
  'NUNCA silencies un guardarraíl: ni --no-verify, ni eslint-disable, ni @ts-ignore, ni tests desactivados, ni umbrales rebajados.',
].join('\n')

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const STDOUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['stdout'],
  properties: { stdout: { type: 'string', description: 'La salida estándar del comando, LITERAL y completa: sin resumir, sin reformatear y sin bloques de código alrededor' } },
}

const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['slug', 'planFile', 'title', 'acceptanceCriteria', 'isVerifiable', 'assumptions', 'blockingQuestions'],
  properties: {
    slug: { type: 'string', description: 'kebab-case corto sacado de la tarea (minúsculas, guiones, sin guion al principio ni al final). Da nombre a la rama feature/<slug> y a la carpeta .claude/tmp/<slug>/' },
    planFile: { type: 'string', description: 'Ruta del plan escrito: .claude/tmp/<slug>/plan.md' },
    title: { type: 'string', description: 'Título de la tarea en español, en imperativo y sin prefijo (será el título de la PR)' },
    acceptanceCriteria: { type: 'array', items: { type: 'string' }, description: 'Cada criterio como "ACn — <comportamiento observable>", en orden' },
    isVerifiable: { type: 'boolean', description: 'true si el cambio se ve en el navegador; false si es invisible (solo dominio, refactor, configuración)' },
    assumptions: { type: 'array', items: { type: 'string' }, description: 'Decisiones tomadas por criterio propio ante ambigüedades. Nunca bloquean.' },
    blockingQuestions: { type: 'array', items: { type: 'string' }, description: 'SOLO callejones sin salida que únicamente puede decidir una persona. Si no está vacío, el workflow para. Déjalo vacío siempre que puedas.' },
  },
}

const PLAN_REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'planEdits', 'droppedFiles', 'addedOptions'],
  properties: {
    verdict: { type: 'string', description: 'Resultado de la revisión del plan en una línea' },
    planEdits: { type: 'array', items: { type: 'string' }, description: 'Cada edición aplicada al plan: "<sección>: <cambio>"' },
    droppedFiles: { type: 'array', items: { type: 'string' }, description: 'Ficheros nuevos sin consumidor que el plan ha quitado o ha tenido que justificar' },
    addedOptions: { type: 'array', items: { type: 'string' }, description: 'La opción más simple añadida para cada supuesto: una alternativa considerada, no una decisión' },
  },
}

const BRANCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['branch', 'onFeatureBranch', 'note'],
  properties: {
    branch: { type: 'string', description: 'La rama de feature en la que está HEAD ahora' },
    onFeatureBranch: { type: 'boolean', description: 'true si HEAD está en una rama feature/… nueva que sale de ' + BASE },
    note: { type: 'string', description: 'Si has guardado cambios en un stash, su mensaje; si no, cadena vacía' },
  },
}

const IMPL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['checkGreen', 'filesChanged', 'notes'],
  properties: {
    checkGreen: { type: 'boolean', description: 'true si `pnpm check` ha pasado entero en la última ejecución' },
    filesChanged: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string', description: 'Decisiones o desviaciones del plan o del arreglo pedido; cadena vacía si no hay' },
  },
}

const CHECKPOINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['committed', 'sha', 'note'],
  properties: {
    committed: { type: 'boolean', description: 'true si existe un commit con el trabajo de esta ronda, o no había nada que commitear' },
    sha: { type: 'string', description: 'sha corto del commit creado; cadena vacía si no se ha creado ninguno' },
    note: { type: 'string', description: 'Qué ha fallado (por ejemplo, el error del pre-commit) o por qué no había nada; cadena vacía si todo ha ido bien' },
  },
}

const FINDING = {
  type: 'object',
  additionalProperties: false,
  required: ['dimension', 'severity', 'file', 'line', 'title', 'detail', 'suggestedFix'],
  properties: {
    dimension: { type: 'string', enum: ['correctness', 'architecture', 'domain', 'tests', 'ui'] },
    severity: { type: 'string', enum: ['critical', 'improvement', 'cleanup'] },
    file: { type: 'string' },
    line: { type: ['integer', 'null'] },
    title: { type: 'string' },
    detail: { type: 'string' },
    suggestedFix: { type: 'string' },
  },
}

const SCORED_REVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['scores', 'verdict', 'findings'],
  properties: {
    scores: {
      type: 'object',
      additionalProperties: false,
      required: ['correctness', 'architecture', 'domain', 'tests', 'ui'],
      properties: {
        correctness: { type: 'number', minimum: 0, maximum: 10 },
        architecture: { type: 'number', minimum: 0, maximum: 10 },
        domain: { type: 'number', minimum: 0, maximum: 10 },
        tests: { type: 'number', minimum: 0, maximum: 10 },
        ui: { type: 'number', minimum: 0, maximum: 10 },
      },
    },
    verdict: { type: 'string', description: 'Recomendación de merge en una línea' },
    findings: { type: 'array', items: FINDING },
  },
}

const TRIAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['decision', 'fixableByAgent', 'reason', 'refinedFix'],
  properties: {
    decision: {
      type: 'string',
      enum: ['apply', 'discard', 'doubt'],
      description: 'apply = defecto real o regla incumplida que merece arreglarse ya; discard = ya está controlado, es intencionado según el plan o el arreglo no mejora nada; doubt = no se puede decidir tras leer el código (va a las salvedades y no se aplica)',
    },
    fixableByAgent: { type: 'boolean', description: 'false si el arreglo necesita a una persona (una decisión de producto, un cambio fuera del repo). Solo cuenta con decision=apply; en otro caso, true' },
    reason: { type: 'string' },
    refinedFix: { type: 'string', description: 'El arreglo concreto si decision=apply; si no, cadena vacía' },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['acResults', 'environmentError'],
  properties: {
    acResults: {
      type: 'array',
      description: 'Una entrada por criterio de aceptación, en orden',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ac', 'result', 'classification', 'observed', 'expected', 'screenshot'],
        properties: {
          ac: { type: 'string' },
          result: { type: 'string', enum: ['pass', 'fail', 'skipped'] },
          classification: { type: 'string', enum: ['pass', 'verifier', 'environment', 'criterion', 'skipped'] },
          observed: { type: 'string' },
          expected: { type: 'string' },
          screenshot: { type: 'string', description: 'Ruta absoluta de la captura; cadena vacía si no hay' },
        },
      },
    },
    environmentError: { type: 'string', description: 'Error literal del entorno si Playwright o la app no han llegado a arrancar; si no, cadena vacía' },
  },
}

const PR_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'prUrl', 'branch', 'blockedCommand', 'reason'],
  properties: {
    status: { type: 'string', enum: ['complete', 'incomplete'], description: "'complete' SOLO si prUrl es la URL de una PR real" },
    prUrl: { type: 'string' },
    branch: { type: 'string' },
    title: { type: 'string' },
    blockedCommand: { type: 'string', description: 'El comando denegado o fallido, literal; cadena vacía si no hay' },
    reason: { type: 'string', description: "Por qué no hay PR; cadena vacía si status es 'complete'" },
  },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const round1 = (n) => Math.round(n * 10) / 10
const findingKey = (f) => (f.file || '') + '|' + (f.title || '')
const mergeInto = (list, items) => {
  const seen = new Set(list.map(findingKey))
  for (const it of items) if (!seen.has(findingKey(it))) { list.push(it); seen.add(findingKey(it)) }
}
const parseJson = (text) => {
  const raw = String(text || '').trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  const start = raw.indexOf('{')
  try {
    return JSON.parse(start > 0 ? raw.slice(start) : raw)
  } catch (e) {
    return null
  }
}

// Runs one deterministic command through a haiku agent and parses its JSON stdout in the script,
// so the result never depends on a model paraphrasing it. One retry on death or unparsable output.
async function runJsonCommand(command, label, phaseTitle) {
  const prompt = [
    'Ejecuta EXACTAMENTE este comando desde la raíz del repo, una sola vez, y devuelve su stdout literal en el campo stdout:',
    '  ' + command,
    'No lo interpretes, no lo resumas, no arregles nada y no ejecutes ningún otro comando. Puede tardar un par de minutos: espera a que termine (timeout de Bash: 600000).',
  ].join('\n')
  for (const attempt of [1, 2]) {
    const out = await agent(prompt, { phase: phaseTitle, label: label + (attempt > 1 ? ' retry' : ''), schema: STDOUT_SCHEMA, ...tier('command') }).catch(() => null)
    const parsed = out && parseJson(out.stdout)
    if (parsed) return parsed
    log(label + ': la salida no es un JSON válido' + (attempt === 1 ? ' — reintento.' : '.'))
  }
  return null
}

// ---------------------------------------------------------------------------
// Analyze
// ---------------------------------------------------------------------------
phase('Analyze')
const analysis = await agent(
  [
    SHARED,
    '',
    'TAREA — ANALIZAR Y PLANIFICAR. Sigue tus instrucciones de analista.',
    'Elige un slug kebab-case corto y escribe el plan en .claude/tmp/<slug>/plan.md (crea la carpeta).',
    'Devuelve el resultado estructurado según el schema.',
  ].join('\n'),
  { agentType: 'researcher', phase: 'Analyze', label: 'analyze', schema: ANALYSIS_SCHEMA, ...tier('deep') },
)
if (!analysis) throw new Error('La fase Analyze no ha devuelto nada: sin plan no se puede seguir.')

const SLUG = String(analysis.slug || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'task'
const PLAN_FILE = analysis.planFile || '.claude/tmp/' + SLUG + '/plan.md'
const WORK_DIR = '.claude/tmp/' + SLUG
const CRITERIA = analysis.acceptanceCriteria || []
const IS_VERIFIABLE = analysis.isVerifiable === true
const assumptions = analysis.assumptions || []
log('Analyze listo — plan: ' + PLAN_FILE + '; ' + CRITERIA.length + ' criterio(s); UI visible: ' + IS_VERIFIABLE + '; ' + assumptions.length + ' supuesto(s)')
if (!CRITERIA.length) log('AVISO: no hay criterios de aceptación; la verificación será débil.')

const blockingQuestions = analysis.blockingQuestions || []
if (blockingQuestions.length) {
  throw new Error(
    'Parado antes de Branch: el plan tiene ' + blockingQuestions.length + ' pregunta(s) BLOQUEANTE(S) que necesitan a una persona:\n' +
      blockingQuestions.map((q, i) => '  ' + (i + 1) + '. ' + q).join('\n'),
  )
}

// ---------------------------------------------------------------------------
// Plan review (background: runs while Branch + Preflight touch only git state)
// ---------------------------------------------------------------------------
phase('Plan review')
const planReviewPromise = agent(
  [
    SHARED,
    '',
    'TAREA — REVISIÓN ADVERSARIA DEL PLAN (simplicidad del diseño). Lee ' + PLAN_FILE + ' y responde dos preguntas comprobándolas en el árbol actual (grep/glob/read, sin especular):',
    '1. Para CADA fichero nuevo que propone el plan, nombra su consumidor: un fichero que ya exista o que cree el mismo plan. Un fichero huérfano rompe `pnpm arch` (no-orphans): quítalo del plan o justifícalo, y apúntalo en droppedFiles.',
    '2. Para CADA supuesto, escribe la opción MÁS SIMPLE que el plan no recoja, apúntala en addedOptions e intégrala en la sección correspondiente como alternativa considerada.',
    'Comprueba además que el diseño respeta las capas (la UI solo usa pokemonService; la lógica pura va en domain/) y que los criterios que tocan tipos citan valores de CONTEXT.md correctos. Corrige el plan si no es así y apúntalo en planEdits.',
    'Aplica cada edición DIRECTAMENTE en ' + PLAN_FILE + ' con Edit o Write. Solo puedes editar ese fichero, y no ejecutes ningún comando git de escritura: se está ejecutando en paralelo con la creación de la rama.',
    'Supuestos del analista: ' + (assumptions.length ? JSON.stringify(assumptions, null, 2) : 'ninguno'),
    'NUNCA es bloqueante: si el plan ya está bien, dilo en verdict y devuelve las listas vacías.',
  ].join('\n'),
  { phase: 'Plan review', label: 'plan-review', schema: PLAN_REVIEW_SCHEMA, ...tier('deep') },
).catch(() => null)

// ---------------------------------------------------------------------------
// Branch
// ---------------------------------------------------------------------------
phase('Branch')
const branchInfo = await agent(
  [
    'TAREA — Deja el repo en una rama de feature nueva antes de cualquier edición.',
    'Nombre objetivo: "feature/' + SLUG + '". Base: ' + BASE + '.',
    '1. `git status --porcelain`. Si hay cambios, NO los descartes: `git stash push -u -m "implement ' + SLUG + '"` y apunta el mensaje en note.',
    '2. `git fetch origin ' + BASE + '` y `git checkout ' + BASE + '`.',
    '3. Si "feature/' + SLUG + '" ya existe (`git branch -a --list "*feature/' + SLUG + '*"`), usa el primer "feature/' + SLUG + '-N" libre (N = 2, 3…). No reutilices una rama existente: podría tener trabajo de otra ejecución.',
    '4. `git checkout -b <nombre>`.',
    'No commitees nada. Confirma con `git branch --show-current` y devuelve la rama.',
  ].join('\n'),
  { phase: 'Branch', label: 'branch', schema: BRANCH_SCHEMA, ...tier('mechanical') },
)
if (!branchInfo || branchInfo.onFeatureBranch !== true || !branchInfo.branch) {
  throw new Error('No se ha podido crear la rama de feature: ' + JSON.stringify(branchInfo))
}
const BRANCH = branchInfo.branch
log('Rama lista: ' + BRANCH + (branchInfo.note ? ' (stash: ' + branchInfo.note + ')' : ''))

// ---------------------------------------------------------------------------
// Preflight
// ---------------------------------------------------------------------------
phase('Preflight')
const preflight = await runJsonCommand(
  PREFLIGHT_CMD + ' --branch ' + BRANCH + (IS_VERIFIABLE && !SKIP_BROWSER ? '' : ' --skip-browser'),
  'preflight',
  'Preflight',
)
if (!preflight || !Array.isArray(preflight.blockers)) {
  throw new Error('Parado antes de Implement: el preflight no ha dado resultado. Un gate que falla rápido no puede pasar en silencio.')
}
// The base-pushed blocker is moot when no PR will be opened.
const blockers = preflight.blockers.filter((b) => !(SKIP_PR && /unpushed commit/.test(b)))
if (blockers.length) {
  throw new Error('Parado antes de Implement — el preflight ha encontrado ' + blockers.length + ' bloqueo(s):\n' + blockers.map((b, i) => '  ' + (i + 1) + '. ' + b).join('\n'))
}
log('Preflight en verde — ' + preflight.checks.map((c) => c.name).join(', '))

// ---------------------------------------------------------------------------
// Implement
// ---------------------------------------------------------------------------
phase('Implement')
const planReview = await planReviewPromise
const planEdits = (planReview && planReview.planEdits) || []
const droppedFiles = (planReview && planReview.droppedFiles) || []
const addedOptions = (planReview && planReview.addedOptions) || []
log(planReview ? 'Revisión del plan: ' + planReview.verdict + ' (' + planEdits.length + ' edición(es))' : 'La revisión del plan no ha devuelto nada; se sigue con el plan original.')

let impl = await agent(
  [
    SHARED,
    '',
    'TAREA — IMPLEMENTAR EL PLAN. Plan: ' + PLAN_FILE + ' (léelo entero: la revisión del plan ya lo ha editado).',
    'Criterios de aceptación: ' + JSON.stringify(CRITERIA),
    'Termina con `pnpm check` en verde. No commitees.',
  ].join('\n'),
  { agentType: 'task-implementer', phase: 'Implement', label: 'implement', schema: IMPL_SCHEMA, ...tier('deep') },
)
if (!impl) throw new Error('El implementador no ha devuelto nada.')
log('Implementación lista — pnpm check: ' + (impl.checkGreen ? 'verde' : 'ROJO') + '; ' + impl.filesChanged.length + ' fichero(s)')

let lastCheckpoint = null
async function checkpoint(label) {
  const result = await agent(
    [
      SHARED,
      '',
      'TAREA — COMMIT DE CHECKPOINT en la rama ' + BRANCH + ' (' + label + '). Lee .claude/skills/commit/SKILL.md y síguelo.',
      'Título orientativo: "' + (analysis.title || 'Implementar ' + SLUG) + (label === 'implement' ? '' : ' (' + label + ')') + '". Sin push.',
      'Si el pre-commit falla, NO lo arregles: devuelve committed=false con el error en note (los gates de la siguiente ronda lo recogerán).',
    ].join('\n'),
    { phase: 'Implement', label: 'checkpoint ' + label, schema: CHECKPOINT_SCHEMA, ...tier('mechanical') },
  ).catch(() => null)
  if (result) lastCheckpoint = result
  log('Checkpoint ' + label + ': ' + (result ? (result.committed ? 'ok ' + result.sha : 'sin commit — ' + result.note) : 'el agente no ha devuelto nada'))
}
await checkpoint('implement')

async function reimplement(round, reason, deltas) {
  const result = await agent(
    [
      SHARED,
      '',
      'TAREA — APLICAR ARREGLOS (ronda ' + round + ': ' + reason + '). Plan de referencia: ' + PLAN_FILE + '.',
      'Cada entrada es un objetivo concreto; trátalas según tus instrucciones (hallazgo, mutante superviviente, gate en rojo o criterio fallido en el navegador):',
      JSON.stringify(deltas, null, 2),
      'Termina con `pnpm check` en verde. No commitees.',
    ].join('\n'),
    { agentType: 'task-implementer', phase: 'Implement', label: 're-implement r' + round, schema: IMPL_SCHEMA, ...tier('deep') },
  ).catch(() => null)
  if (result) impl = result
  await checkpoint('r' + round)
}

// ---------------------------------------------------------------------------
// Review ⇄ Verify loop
// ---------------------------------------------------------------------------
let round = 0
let reviewState = null // { mergeSafety, rawScore, scores, verdict }
let lastGates = null
let reviewThresholdMet = false
let reviewUnavailable = ''
let prevSig = ''
let lastAppliedDeltas = []
let openFindings = []
const appliedFindings = []
const discardedFindings = []
const doubtFindings = []
const deferredImprovements = []
const humanOnlyFindings = []
const cleanupNotes = []
let browserState = null
let browserNote = ''

function scoredReviewPrompt(round) {
  const common = [
    SHARED,
    '',
    'Los gates deterministas se están ejecutando en paralelo contigo: NO ejecutes gates.mjs, pnpm check ni Stryker.',
    'Base del diff: ' + BASE + '. Plan (contexto de negocio): ' + PLAN_FILE + '. Criterios: ' + JSON.stringify(CRITERIA),
    'Supuestos del analista (decisiones intencionadas: tenlas en cuenta antes de marcar una como defecto): ' + JSON.stringify(assumptions),
  ]
  if (round > 1 && reviewState) {
    return [
      ...common,
      'TAREA — RE-SCORE DELTA (ronda ' + round + '). La revisión completa ya se hizo; desde entonces se han aplicado estos arreglos. Verifica CADA UNO contra el código actual (`git log --oneline -5`, `git show`) y revisa lo que puedan haber roto:',
      JSON.stringify(lastAppliedDeltas, null, 2),
      'Notas de la ronda anterior: ' + JSON.stringify(reviewState.scores) + ' — ' + reviewState.verdict,
      'Mueve cada nota SOLO por lo que hayan cambiado estos arreglos. Un arreglo incompleto, incorrecto o que rompe algo es un hallazgo nuevo.',
      'No vuelvas a abrir lo que ya está en el registro (descartados, dudas, aplazados), salvo que un arreglo haya roto el código de alrededor: ' + JSON.stringify({ discarded: discardedFindings, doubts: doubtFindings, deferred: deferredImprovements }),
      'Devuelve las cinco notas, el veredicto y todos los hallazgos según el schema.',
    ].join('\n')
  }
  return [
    ...common,
    'TAREA — REVISIÓN PUNTUADA (ronda ' + round + '). Sigue la skill review-pr en modo rama contra ' + BASE + ', con los cambios sin commitear incluidos. No publiques nada.',
    'Devuelve las cinco notas (0-10), el veredicto y TODOS los hallazgos, cada uno con severity critical|improvement|cleanup, dimension, file, line y un suggestedFix concreto.',
  ].join('\n')
}

function triagePrompt(f, round) {
  return [
    SHARED,
    '',
    'TAREA — TRIAJE DE UN HALLAZGO DE REVISIÓN (ronda ' + round + '). Decide apply, discard o doubt leyendo el código real alrededor del hallazgo, el plan ' + PLAN_FILE + ', los supuestos y los commits (`git log --oneline ' + BASE + '..HEAD`).',
    '1. ¿YA CONTROLADO? Está resuelto en otra parte del código.',
    '2. ¿INTENCIONADO? Un supuesto o el plan decide ESE defecto concreto. Cítalo literal en reason; un supuesto sobre otro matiz no vale.',
    '3. ¿MEJORA REAL? El arreglo mejora la corrección o el cumplimiento de AGENTS.md o CONTEXT.md, y no se limita a mover código que ya funciona.',
    '4. ¿LO ARREGLA UN AGENTE? fixableByAgent=false solo si necesita a una persona (una decisión de producto o algo fuera del repo).',
    'Sí a 1 o 2, o no a 3 → discard, con la evidencia. Defecto claro → apply, con un refinedFix concreto. Si tras leer el código sigues sin saberlo → doubt.',
    'Si el hallazgo es de dominio, compara con la tabla de CONTEXT.md celda a celda antes de decidir.',
    'Supuestos: ' + JSON.stringify(assumptions),
    'Hallazgo: ' + JSON.stringify(f, null, 2),
  ].join('\n')
}

async function scoredReview(round) {
  const opts = { agentType: 'reviewer', phase: 'Review', label: 'scored-review r' + round, schema: SCORED_REVIEW_SCHEMA, ...tier('deep') }
  const first = await agent(scoredReviewPrompt(round), opts).catch(() => null)
  if (first) return first
  log('La revisión puntuada (ronda ' + round + ') no ha devuelto nada — reintento.')
  return agent(scoredReviewPrompt(round), { ...opts, label: 'scored-review-retry r' + round }).catch(() => null)
}

function gateDeltas(gates) {
  if (!gates) return [{ source: 'gates', file: '', title: 'Los gates no han dado resultado', detail: 'gates.mjs no ha devuelto un JSON válido', fix: 'Ejecuta `' + GATES_CMD + '` y arregla lo que falle.' }]
  return gates.gates.filter((g) => !g.ok).flatMap((g) => {
    if (g.name === 'mutation' && g.survivors && g.survivors.length) {
      return g.survivors.map((s) => ({
        source: 'gate:mutation',
        severity: 'critical',
        file: s.file,
        title: 'Mutante superviviente en ' + s.file + ':' + s.line + ' (' + s.mutator + ')',
        detail: 'Stryker ha sustituido el código de la línea ' + s.line + ' por `' + s.replacement + '` y ningún test ha fallado (' + s.status + ').',
        fix: 'Escribe el test que falla con `' + s.replacement + '` en esa línea y pasa con el código original. No cambies el código de producción.',
      }))
    }
    return [{ source: 'gate:' + g.name, severity: 'critical', file: '', title: 'Gate ' + g.name + ' en rojo', detail: g.tail || '', fix: 'Lee ' + g.log + ', arregla la causa y vuelve a ejecutar el gate.' }]
  })
}

function verifyPrompt(round) {
  const specsExist = browserState !== null
  return [
    SHARED,
    '',
    'TAREA — VERIFICAR EN NAVEGADOR (ronda ' + round + '). Carpeta de trabajo: ' + WORK_DIR + '/ (specs en ' + WORK_DIR + '/e2e/, capturas en ' + WORK_DIR + '/shots/).',
    specsExist
      ? 'Los specs ya existen de una ronda anterior y la app ha cambiado para arreglar criterios fallidos. Ejecútalos tal cual (`pnpm e2e ' + WORK_DIR + '`). Solo los tocas si el fallo es tuyo (verifier).'
      : 'Escribe un test por criterio siguiendo la skill verify-browser, ejecútalo con `pnpm e2e ' + WORK_DIR + '` y clasifica cada fallo.',
    'Plan: ' + PLAN_FILE,
    'Criterios de aceptación: ' + JSON.stringify(CRITERIA, null, 2),
    'Devuelve una entrada por criterio, con la ruta ABSOLUTA de su captura.',
  ].join('\n')
}

while (round < MAX_ROUNDS) {
  round++

  // ---- (a) Deterministic gates ‖ scored review → triage ----
  // Genuine barrier: the round's outcome needs the gates, the score and the triage verdicts together.
  phase('Review')
  reviewThresholdMet = false
  const [gates, scoredOutcome] = await parallel([
    () => runJsonCommand(GATES_CMD, 'gates r' + round, 'Review'),
    () =>
      scoredReview(round).then(async (sr) => {
        if (!sr) return null
        const findings = sr.findings || []
        const actionable = findings.filter((f) => f.severity === 'critical' || f.severity === 'improvement')
        const triaged = await parallel(
          actionable.map((f, i) => () =>
            agent(triagePrompt(f, round), { phase: 'Review', label: 'triage#' + i + ' r' + round, schema: TRIAGE_SCHEMA, ...tier('deep') })
              .then((t) => ({ finding: f, triage: t }))
              // A dead triage agent must neither apply nor drop the finding: it becomes a doubt.
              .catch(() => ({ finding: f, triage: null })),
          ),
        )
        return { review: sr, triaged: triaged.filter(Boolean), cleanups: findings.filter((f) => f.severity === 'cleanup') }
      }),
  ])
  lastGates = gates
  const gatesGreen = !!(gates && gates.green)
  const mechDeltas = gateDeltas(gates)

  const triaged = (scoredOutcome && scoredOutcome.triaged) || []
  const applyDecided = triaged.filter((t) => t.triage && t.triage.decision === 'apply')
  const toApply = applyDecided.filter((t) => t.triage.fixableByAgent !== false)
  mergeInto(humanOnlyFindings, applyDecided.filter((t) => t.triage.fixableByAgent === false).map((t) => ({ file: t.finding.file, title: t.finding.title, reason: t.triage.reason, fix: t.triage.refinedFix || t.finding.suggestedFix, round })))
  mergeInto(discardedFindings, triaged.filter((t) => t.triage && t.triage.decision === 'discard').map((t) => ({ file: t.finding.file, title: t.finding.title, reason: t.triage.reason, round })))
  mergeInto(doubtFindings, triaged.filter((t) => !t.triage || t.triage.decision === 'doubt').map((t) => ({ file: t.finding.file, title: t.finding.title, reason: t.triage ? t.triage.reason : 'el agente de triaje no ha devuelto nada', round })))
  mergeInto(cleanupNotes, ((scoredOutcome && scoredOutcome.cleanups) || []).map((f) => ({ file: f.file, title: f.title, detail: f.detail })))

  // From round 2 on only criticals buy another cycle; confirmed improvements go to the caveats.
  const applyNow = round === 1 ? toApply : toApply.filter((t) => t.finding.severity === 'critical')
  mergeInto(deferredImprovements, toApply.filter((t) => !applyNow.includes(t)).map((t) => ({ file: t.finding.file, title: t.finding.title, fix: t.triage.refinedFix || t.finding.suggestedFix, round })))

  if (scoredOutcome) {
    const s = scoredOutcome.review.scores
    const rawScore = round1(Object.keys(WEIGHTS).reduce((sum, k) => sum + WEIGHTS[k] * s[k], 0))
    reviewState = { rawScore, mergeSafety: gatesGreen ? rawScore : Math.min(rawScore, RED_GATE_CAP), scores: s, verdict: scoredOutcome.review.verdict || '' }
    reviewUnavailable = ''
  } else {
    reviewUnavailable = 'La revisión puntuada no ha dado resultado en la ronda ' + round + ' (tras un reintento): esta ejecución no tiene Merge Safety.'
  }

  const s = reviewState && reviewState.scores
  log(
    'Ronda ' + round + ' — gates ' + (gatesGreen ? 'verdes' : 'en ROJO (' + mechDeltas.length + ')') + ' · ' +
      (scoredOutcome && s
        ? 'Merge Safety ' + reviewState.mergeSafety + '/10' + (gatesGreen ? '' : ' (tope ' + RED_GATE_CAP + '; sin tope ' + reviewState.rawScore + ')') + ' [Corr ' + s.correctness + ' · Arq ' + s.architecture + ' · Dom ' + s.domain + ' · Tests ' + s.tests + ' · UI ' + s.ui + ']'
        : 'sin nota') +
      ' · ' + applyNow.length + ' a aplicar, ' + deferredImprovements.length + ' aplazado(s), ' + discardedFindings.length + ' descartado(s), ' + doubtFindings.length + ' duda(s), ' + humanOnlyFindings.length + ' para una persona',
  )

  const deltas = [
    ...mechDeltas,
    ...applyNow.map((t) => ({ source: 'review:' + t.finding.dimension, severity: t.finding.severity, file: t.finding.file, title: t.finding.title, detail: t.finding.detail, fix: t.triage.refinedFix || t.finding.suggestedFix })),
  ]

  if (deltas.length > 0) {
    const sig = deltas.map((d) => d.source + '|' + d.file + '|' + d.title).sort().join(' ;; ')
    // Convergence guard: the same findings after a re-implement means the fix is not converging.
    if (sig === prevSig) {
      openFindings = deltas.map((d) => ({ source: d.source, file: d.file, title: d.title }))
      log('Sin progreso: los mismos ' + deltas.length + ' hallazgo(s) han vuelto tras re-implementar. Se pasa a la PR con salvedades.')
      break
    }
    prevSig = sig
    if (round >= MAX_ROUNDS) {
      openFindings = deltas.map((d) => ({ source: d.source, file: d.file, title: d.title }))
      log('Tope de rondas (' + MAX_ROUNDS + ') con ' + deltas.length + ' hallazgo(s) sin aplicar.')
      break
    }
    appliedFindings.push(...deltas.map((d) => ({ source: d.source, file: d.file, title: d.title, round })))
    lastAppliedDeltas = deltas
    await reimplement(round, 'hallazgos de revisión y gates', deltas)
    continue
  }

  // Nothing left to apply. A score below threshold here cannot converge: everything actionable was
  // discarded, deferred or doubted — break with the caveat instead of re-reviewing an unchanged branch.
  if (scoredOutcome && reviewState.mergeSafety < MIN_SCORE) {
    openFindings.push({ source: 'review', file: '', title: 'Merge Safety ' + reviewState.mergeSafety + ' por debajo de ' + MIN_SCORE + ' sin nada aplicable (todo lo accionable se ha descartado, aplazado o dejado como duda)' })
    log('Nota por debajo del umbral sin nada aplicable. Se pasa a la PR con salvedades.')
    break
  }
  reviewThresholdMet = !!scoredOutcome

  // ---- (b) Clean review. If the change is visible, verify it in the browser. ----
  if (!IS_VERIFIABLE || SKIP_BROWSER) {
    if (IS_VERIFIABLE) browserNote = 'Verificación en navegador saltada (skipBrowser=true).'
    break
  }

  phase('Verify')
  let verify = await agent(verifyPrompt(round), { agentType: 'browser-verifier', phase: 'Verify', label: 'browser-verify r' + round, schema: VERIFY_SCHEMA, ...tier('standard') }).catch(() => null)
  if (!verify) verify = await agent(verifyPrompt(round), { agentType: 'browser-verifier', phase: 'Verify', label: 'browser-verify-retry r' + round, schema: VERIFY_SCHEMA, ...tier('standard') }).catch(() => null)
  if (!verify) {
    browserNote = 'El verificador de navegador no ha devuelto nada (tras un reintento): los criterios NO se han verificado en el navegador.'
    log(browserNote)
    break
  }
  browserState = verify

  const results = verify.acResults || []
  const envFails = results.filter((r) => r.classification === 'environment')
  const criterionFails = results.filter((r) => r.classification === 'criterion')
  const verifierFails = results.filter((r) => r.classification === 'verifier')
  log('Navegador (ronda ' + round + ') — ' + results.filter((r) => r.result === 'pass').length + '/' + results.length + ' en verde; ' + criterionFails.length + ' de criterio, ' + verifierFails.length + ' del verificador, ' + envFails.length + ' de entorno')

  if (verify.environmentError || envFails.length) {
    browserNote = 'Fallo de entorno en el navegador: ' + (verify.environmentError || envFails.map((r) => r.ac + ': ' + r.observed).join(' | ')) + '. Los criterios afectados NO están verificados.'
    break
  }
  if (!criterionFails.length) {
    if (verifierFails.length) browserNote = verifierFails.length + ' criterio(s) sin verificar: el spec no se ha podido estabilizar en 2 intentos (fallo del verificador, no de la app).'
    break
  }
  if (round >= MAX_ROUNDS) {
    openFindings.push(...criterionFails.map((r) => ({ source: 'browser', file: '', title: 'Criterio fallido en el navegador: ' + r.ac })))
    log('Tope de rondas con criterios fallidos en el navegador. Se pasa a la PR con salvedades.')
    break
  }
  const browserDeltas = criterionFails.map((r) => ({ source: 'browser', severity: 'critical', file: '', title: 'Criterio fallido: ' + r.ac, detail: 'Observado: ' + r.observed + '\nEsperado: ' + r.expected, fix: 'Mira la captura ' + r.screenshot + ' y haz que la app cumpla el criterio.' }))
  appliedFindings.push(...browserDeltas.map((d) => ({ source: d.source, file: d.file, title: d.title, round })))
  lastAppliedDeltas = browserDeltas
  prevSig = ''
  await reimplement(round, 'criterios fallidos en el navegador', browserDeltas)
}

// ---------------------------------------------------------------------------
// PR
// ---------------------------------------------------------------------------
phase('PR')
const redPushGates = lastGates ? lastGates.gates.filter((g) => PUSH_GATES.includes(g.name) && !g.ok).map((g) => g.name) : PUSH_GATES
const screenshots = ((browserState && browserState.acResults) || []).filter((r) => r.screenshot).map((r) => ({ path: r.screenshot, ac: r.ac, result: r.result }))

const gatesSummary = lastGates
  ? lastGates.gates.map((g) => g.name + ': ' + (g.skipped ? 'saltado (el diff no toca domain/ ni services/)' : g.ok ? 'verde' : 'ROJO')).join(', ')
  : 'sin resultado'
const browserSummary = !IS_VERIFIABLE
  ? 'No aplica: el cambio no tiene UI visible.'
  : browserState
    ? JSON.stringify(browserState.acResults.map((r) => ({ ac: r.ac, result: r.result, classification: r.classification, observed: r.observed }))) + (browserNote ? ' — ' + browserNote : '')
    : 'NO ejecutada — ' + (browserNote || 'la revisión no llegó a quedar limpia')

const caveatsInput = [
  'Gates (última ronda): ' + gatesSummary + '.',
  'Revisión: ' + (reviewState ? 'Merge Safety ' + reviewState.mergeSafety + '/10 tras ' + round + ' ronda(s), umbral ' + MIN_SCORE + (reviewThresholdMet ? ' CUMPLIDO' : ' NO cumplido') + '. Notas: ' + JSON.stringify(reviewState.scores) + '. ' + reviewState.verdict : reviewUnavailable || 'no se ejecutó'),
  'Navegador: ' + browserSummary,
  'Supuestos del analista (para que quien revise los confirme): ' + (assumptions.length ? JSON.stringify(assumptions) : 'ninguno'),
  'Alternativas más simples añadidas en la revisión del plan (consideradas, no tomadas): ' + (addedOptions.length ? JSON.stringify(addedOptions) : 'ninguna'),
  'Ficheros quitados o justificados en la revisión del plan: ' + (droppedFiles.length ? JSON.stringify(droppedFiles) : 'ninguno'),
  'Hallazgos sin resolver: ' + (openFindings.length ? JSON.stringify(openFindings) : 'ninguno'),
  'Mejoras confirmadas pero aplazadas: ' + (deferredImprovements.length ? JSON.stringify(deferredImprovements) : 'ninguna'),
  'Hallazgos reales que necesitan a una persona: ' + (humanOnlyFindings.length ? JSON.stringify(humanOnlyFindings) : 'ninguno'),
  'Dudas sin decidir (preguntas abiertas para quien revise): ' + (doubtFindings.length ? JSON.stringify(doubtFindings) : 'ninguna'),
  'Descartados en el triaje (por transparencia): ' + (discardedFindings.length ? JSON.stringify(discardedFindings) : 'ninguno'),
].join('\n')

let prResult
if (SKIP_PR) {
  prResult = { status: 'skipped', prUrl: '', branch: BRANCH, blockedCommand: '', reason: 'skipPr=true' }
} else if (redPushGates.length) {
  // pnpm verify in pre-push would refuse the push: stop with a named reason instead of a failed PR phase.
  prResult = { status: 'incomplete', prUrl: '', branch: BRANCH, blockedCommand: 'git push', reason: 'Gates en rojo que el pre-push (pnpm verify) rechazaría: ' + redPushGates.join(', ') + '. El trabajo queda en ' + BRANCH + '.' }
} else {
  prResult = await agent(
    [
      SHARED,
      '',
      'TAREA — ABRIR LA PR en borrador contra ' + BASE + ' desde ' + BRANCH + '. Sigue la skill commit (si queda algo sin commitear) y después la skill open-pr.',
      'Título: "' + (analysis.title || SLUG) + '". Plan (para "Qué cambia"): ' + PLAN_FILE + '. Escribe el cuerpo en ' + WORK_DIR + '/pr-body.md.',
      'Criterios de aceptación: ' + JSON.stringify(CRITERIA),
      'Capturas a publicar (ruta y criterio): ' + (screenshots.length ? JSON.stringify(screenshots) : 'ninguna: dilo en Verificación'),
      'Estado para las secciones Verificación y Salvedades (tal cual, sin adornarlo):',
      caveatsInput,
    ].join('\n'),
    { agentType: 'pr-creator', phase: 'PR', label: 'open PR', schema: PR_SCHEMA, ...tier('standard') },
  ).catch(() => null)
}
log('PR [' + ((prResult && prResult.status) || 'incomplete') + '] ' + ((prResult && (prResult.prUrl || prResult.reason)) || 'el agente no ha devuelto nada'))

return {
  task: TASK,
  specFile: SPEC_FILE,
  slug: SLUG,
  planFile: PLAN_FILE,
  branch: BRANCH,
  pr: prResult || { status: 'incomplete', prUrl: '', branch: BRANCH, reason: 'la fase PR no ha devuelto nada' },
  checkpoint: lastCheckpoint,
  gates: lastGates ? { green: lastGates.green, gates: lastGates.gates.map((g) => ({ name: g.name, ok: g.ok, skipped: !!g.skipped, log: g.log })) } : null,
  review: {
    mergeSafety: reviewState ? reviewState.mergeSafety : null,
    scores: reviewState ? reviewState.scores : null,
    threshold: MIN_SCORE,
    thresholdMet: reviewThresholdMet,
    rounds: round,
    verdict: reviewState ? reviewState.verdict : '',
    applied: appliedFindings,
    open: openFindings,
    deferred: deferredImprovements,
    humanOnly: humanOnlyFindings,
    doubts: doubtFindings,
    discarded: discardedFindings,
    cleanups: cleanupNotes,
    note: reviewUnavailable,
  },
  browser: IS_VERIFIABLE
    ? { status: browserState ? 'run' : 'not-run', acResults: browserState ? browserState.acResults : [], note: browserNote }
    : { status: 'n/a', note: 'sin UI visible' },
  assumptions,
  planReview: { verdict: (planReview && planReview.verdict) || '', planEdits, droppedFiles, addedOptions },
}
