# Instrucciones para agentes

Este repo aloja la PokéApp: un explorador de los 151 Pokémon de Kanto sobre PokéAPI v2. La app es
el pretexto. El entregable es la red de verificación que la rodea.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->

## Los seis gates

Ninguna línea de producción entra sin pasar los seis. Un gate en rojo impide el push.

| # | gate | comando | qué exige |
|---|---|---|---|
| 5 | mutación | `pnpm mutation` | 100 % de mutantes muertos en `src/domain` y `src/application` |
| 6 | cobertura | `pnpm coverage` | 100 % líneas y ramas en `domain`, `application` y `tools`; 90 % en `infrastructure`; 60 % en `ui` |
| 7 | calidad de tests | `pnpm lint` | ni tests enfocados, ni desactivados, ni sin aserción, ni con `expect` condicional, ni con título repetido |
| 8 | riesgo CRAP | `pnpm crap` | ninguna función por encima de CRAP 8 |
| 9 | duplicación | `pnpm duplication` | cero duplicación estructural por encima de 50 tokens |
| 10 | arquitectura | `pnpm arch` | la dependencia apunta hacia dentro, sin ciclos ni módulos huérfanos |

`pnpm crap` lee `reports/coverage/coverage-final.json`, así que solo dice la verdad después de un
`pnpm coverage` reciente.

## Cómo saber que has terminado

```bash
pnpm verify
```

Ejecuta tipos, lint y los seis gates en orden. Es el mismo comando que corre el hook de pre-push:
si pasa en tu máquina, el push sale. No hay una segunda lista en otro sitio que pueda divergir.

En cada commit se adelanta lo barato — tipos, lint de los ficheros preparados y tests relacionados
con lo modificado — para que lo que se puede saber pronto no se descubra tarde.

## Regla de integridad

Bajar un umbral, añadir una desactivación de lint o excluir un fichero del alcance de una
herramienta **no es una forma válida de poner un gate en verde**. La única salida es arreglar el
código.

Si un umbral resulta inviable, se para y se decide de forma explícita, fuera del diff. Un gate que
se afloja para que pase deja de medir nada.

## Arquitectura

Cuatro capas con la dependencia hacia dentro:

- `src/domain` — tipos y reglas puras. No importa de ninguna otra capa.
- `src/application` — casos de uso. Solo importa de `domain`.
- `src/infrastructure` — cliente de PokéAPI y mapeo de DTOs. Se enchufa únicamente desde
  `src/composition-root.tsx`.
- `src/ui` — React. No importa de `infrastructure`.

La separación no es estética: sin ella la mutación se llena de supervivientes en JSX y el CRAP mide
complejidad de componentes en vez de reglas de negocio.

## Tests de referencia

Hay dos seams, y solo dos. No se mockean piezas internas: el único doble del proyecto es la red, y
vive en la frontera HTTP.

**Núcleo puro** — sin React ni fetch, entrada y salida directas:

- `tests/core/pokedex-number.test.ts`
- `tests/core/pokemon-name.test.ts`
- `tests/core/view-pokemon.test.ts`

**Aplicación montada** — se conduce por lo que ve la persona usuaria, con MSW interceptando en
HTTP y respuestas reales de PokéAPI commiteadas como fixtures:

- `tests/app/seed-pokemon.test.tsx`
- El servidor de dobles vive en `tests/support/poke-api-server.ts` y las respuestas capturadas en
  `tests/fixtures/`.

Imita estos. No añadas tests de componentes React sueltos, ni del cliente HTTP por separado, ni de
repositorios.

El gate de CRAP es código de producción de este repo y pasa por los mismos gates que el resto: sus
tests están en `tests/core/crap.test.ts`.
