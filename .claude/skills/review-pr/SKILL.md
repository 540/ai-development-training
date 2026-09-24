---
name: review-pr
description: Revisa un cambio de la Pokédex (la rama actual contra harness, o una PR por número o URL). Ejecuta los gates deterministas (pnpm check, duplicación, cobertura, CRAP y Stryker acotado al diff) y hace una revisión puntuada por dimensiones (Corrección, Arquitectura, Dominio, Tests, UI) que da una Merge Safety de 0 a 10 y hallazgos con severidad. Úsala cuando quieras revisar una rama o una PR, comprobar si un cambio está listo para mergear o auditar un diff.
argument-hint: "[número o URL de PR | rama base]"
---

# Revisión puntuada de la Pokédex

## 1. Qué se revisa

| Argumento | Modo | Base del diff |
|---|---|---|
| ninguno | Rama actual, cambios sin commitear incluidos | `harness` |
| nombre de rama | Rama actual | esa rama |
| número o URL de PR | `gh pr checkout <pr>` y se revisa esa rama | `gh pr view <pr> --json baseRefName -q .baseRefName` |

En modo PR, el contexto de negocio es el cuerpo de la PR (`gh pr view <pr> --json title,body`). En modo rama, el plan o los criterios que te pasen; si no hay ninguno, deduce la intención de los commits (`git log --oneline <base>..HEAD`).

## 2. Gates deterministas

```bash
node .claude/skills/review-pr/scripts/gates.mjs --base <base>
```

Imprime un JSON y lo guarda en `.claude/tmp/gates/result.json`:

- `changedFiles`: los ficheros del diff. **Revisa estos y solo estos.**
- `green`: `true` si todos los gates pasan.
- `gates[]`: `check`, `duplication`, `coverage`, `crap` y `mutation`, cada uno con `ok`, `log` (el log completo) y `tail` (el final del log si falla).
- `gates[mutation]`: `files` (los ficheros de `domain/` o `services/` del diff que se han mutado; si no hay ninguno, `skipped: true`) y `survivors` (`file`, `line`, `mutator`, `replacement`, `status`).

Cada gate en rojo es un hallazgo **critical** de la dimensión que le toque (`check`/`crap` → Corrección o Tests, `duplication` → Arquitectura, `coverage` → Tests). Cada superviviente de Stryker es un hallazgo **critical** de Tests: indica el mutante y el caso de test que lo mataría.

**Si te dicen que los gates ya se ejecutan aparte (modo workflow), no los ejecutes**: haz solo la revisión.

## 3. Revisión por dimensiones

Lee el diff (`git diff <merge-base>`) y los ficheros completos que toca, no solo los fragmentos. Antes de tocar nada de tipos, lee `CONTEXT.md` (la skill `pokedex-domain` explica cómo).

| Dimensión | Peso | Qué mira |
|---|---|---|
| Corrección | 30 % | Bugs, casos borde, estados de carga y de error, dependencias de `useEffect`, carreras en peticiones, claves de listas |
| Arquitectura | 20 % | Capas `domain → infrastructure → services → ui`; la UI solo usa `pokemonService`; el cableado en `_di`/`src/di`; piezas nuevas sin consumidor; duplicación |
| Dominio | 20 % | Fidelidad a `CONTEXT.md`: identificadores de tipo, **tabla de efectividad celda a celda** en lo que toque el diff, doble tipo multiplicativo, rangos de generación |
| Tests | 20 % | Que cada criterio de aceptación tenga un test; que las aserciones sean de comportamiento; que no sean frágiles ni tautológicas; los supervivientes de mutación |
| UI y estilos | 10 % | Variables de `globals.css`, CSS modules, textos en inglés, accesibilidad básica (roles, `alt`, labels, foco) |

Cada dimensión se puntúa de 0 a 10:

- **10**: nada que objetar.
- **8-9**: solo mejoras o limpiezas.
- **5-7**: al menos un hallazgo critical acotado.
- **0-4**: fallo grave (el criterio no se cumple, capa rota, regla de dominio mal).

**Merge Safety** = 0,3·Corrección + 0,2·Arquitectura + 0,2·Dominio + 0,2·Tests + 0,1·UI, con un decimal. **Si algún gate está en rojo, la Merge Safety tiene un tope de 5.**

### Severidad de los hallazgos

- **critical**: bug, criterio sin cumplir, violación de una regla de `AGENTS.md` o de `CONTEXT.md`, gate en rojo, mutante superviviente.
- **improvement**: el código funciona, pero hay una versión claramente mejor (legibilidad, un test que falta en un caso borde, simplificación).
- **cleanup**: estético o de nombres, sin impacto.

Cada hallazgo lleva `dimension`, `severity`, `file`, `line`, `title`, `detail` (qué falla y por qué, con evidencia) y `suggestedFix` (un cambio concreto, no "mejorar X"). No reportes lo que ya está bien ni supuestos que no hayas comprobado en el código.

## 4. Informe

```
## Revisión — <rama o PR> contra <base>

**Merge Safety: X.X / 10** — <recomendación en una línea>
Gates: check ✅ · duplicación ✅ · cobertura ✅ · CRAP ✅ · mutación ✅ (o ⏭ sin ficheros)

| Dimensión | Nota |
|---|---|
| Corrección | x |
| Arquitectura | x |
| Dominio | x |
| Tests | x |
| UI y estilos | x |

### Critical
- `file:line` — título. Detalle. **Arreglo:** …

### Improvement
…

### Cleanup
…
```

En modo PR, al final pregunta si quieren publicar el informe como comentario (`gh pr comment <pr> --body-file <fichero>`). **Nunca publiques sin confirmación**, y en modo workflow no publiques nunca.
