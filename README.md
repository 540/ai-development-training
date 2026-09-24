# Pokédex — con el harness montado

Pokédex sobre [PokéAPI](https://pokeapi.co): listado por generación con buscador y filtros, y ficha de cada Pokémon. Adaptada de [pokedex-taller-scpna](https://github.com/Endikaorve/pokedex-taller-scpna), de Endika Orve, con su permiso.

La app es el pretexto. Esta rama cierra la progresión de las prácticas: la misma Pokédex, con los guardarraíles del equipo y la red de verificación completa, para responder a una pregunta concreta: ¿puedo dejar de leer el código que escribe un agente si una red lo verifica por mí?

## La red

| gate | herramienta | umbral |
|---|---|---|
| tipos | TypeScript | el proyecto compila |
| lint | ESLint | nombres en camelCase o PascalCase, sin `any`, sin colores en crudo, las vistas no llaman a la API, tests sin enfocar, desactivar ni quedarse sin aserción |
| estilos | Stylelint | clases en camelCase y sin colores en crudo |
| idioma | cspell | el código, en inglés |
| arquitectura | dependency-cruiser | la dependencia apunta hacia dentro, sin ciclos ni huérfanos |
| duplicación | jscpd | cero duplicación por encima de 50 tokens |
| cobertura | Vitest e istanbul | 100 % en dominio, servicios y `tools`; 90 % en infraestructura; 60 % en la interfaz |
| riesgo CRAP | script propio (`tools/crap`) | ninguna función por encima de CRAP 8 |
| mutación | StrykerJS | 100 % de mutantes muertos en dominio y servicios |

## Lo que la red no garantiza

Los gates verifican el **código**, no lo que el negocio pidió: un agente puede dejarlos todos en verde implementando mal una regla. Y un gate en verde no dice cuánto protege: la mutación pasa al 100 %, pero el dominio apenas tiene lógica y la conversión de la API vive en infraestructura, que no se muta.

## Cómo se ejecuta

```bash
pnpm install   # instala también los hooks de git
pnpm check     # lo rápido: tipos, lint, estilos, idioma, arquitectura y tests
pnpm verify    # la red entera, salvo la mutación
```

Cada gate por separado:

```bash
pnpm typecheck   pnpm lint       pnpm lint:css   pnpm spell   pnpm arch
pnpm duplication pnpm coverage   pnpm crap       pnpm mutation
```

`pnpm crap` lee el informe de `pnpm coverage`, así que necesita uno reciente.

### Cuándo corren

- **Mientras el agente trabaja**: después de cada edición, ESLint, Stylelint y cspell revisan ese fichero y le devuelven los errores; al terminar, `pnpm check`. Configurado para Claude Code (`.claude/`), Codex (`.codex/`), Cursor (`.cursor/`) y Copilot (`.github/hooks/`). Antigravity (`.agents/`) solo revisa al terminar.
- **pre-commit**: tipos, lint, estilos, idioma y los tests relacionados con lo modificado.
- **pre-push**: `pnpm verify` (sin mutación).
- **Revisión** (skill `review-pr` y fase Review del workflow): todo lo anterior más Stryker acotado a los ficheros de dominio y servicios que toca el diff.

## Workflow de implementación

`.claude/workflows/implement.mjs` lleva una tarea hasta una PR en borrador contra `harness`, con subagentes separados por fase:

| Fase | Quién | Qué |
|---|---|---|
| Analyze | `researcher` | Plan con criterios de aceptación en `.claude/tmp/<slug>/plan.md` |
| Plan review | agente del workflow | Quita ficheros sin consumidor y añade la opción más simple a cada supuesto |
| Branch | agente del workflow | `feature/<slug>` desde `harness` |
| Preflight | `.claude/scripts/preflight.mjs` | git y gh, Chromium de Playwright y `pnpm check` en verde antes de tocar nada |
| Implement | `task-implementer` | Código y tests hasta `pnpm check` en verde, y commit de checkpoint |
| Review | `gates.mjs` ‖ `reviewer` → triaje | Gates deterministas y Merge Safety ponderada; bucle de hasta 3 rondas |
| Verify | `browser-verifier` | Un spec de Playwright desechable por criterio, con PokéAPI mockeada y una captura cada uno |
| PR | `pr-creator` | Push y PR en borrador con salvedades y capturas |

Se lanza desde Claude Code pidiéndole que ejecute el workflow `implement` con `{ task: "…" }` o `{ specFile: "specs/x.md" }`. Opciones: `maxRounds`, `minScore`, `skipBrowser`, `skipPr`, `baseBranch`, `model` y `effort`.

Cada paso existe también como skill suelta: `/review-pr [PR]`, `/verify-browser "criterios"`, `/commit` y `/open-pr`. La primera vez, `pnpm exec playwright install chromium` (el preflight lo hace solo).

## Práctica

Lanza este prompt a tu agente:

> Añade al proyecto web una tabla interactiva con las ventajas y desventajas entre todos los tipos de Pokémon.
