---
name: commit
description: Commitea el trabajo en curso de la Pokédex con el estilo del repo. Revisa el diff, mete en stage solo los ficheros del cambio (nunca .claude/ ni CLAUDE.md), escribe el mensaje en español en imperativo, deja que el pre-commit haga su trabajo y nunca reescribe la historia. Úsala cuando quieras hacer commit o guardar un checkpoint.
argument-hint: "[mensaje o intención del commit]"
---

# Commit

## 1. Mira qué hay

```bash
git status --short
git diff
git diff --cached
git log --oneline -10
```

Si estás en `harness`, `version-final` o `main`, **para**: los commits de trabajo van en una rama de feature. Díselo al usuario, o en el workflow reporta `committed: false` con la nota.

## 2. Stage selectivo

- Añade los ficheros por su nombre (`git add <ruta> …`). **Nunca** `git add -A`, `git add .` ni `git commit -a`.
- **Nunca** metas en stage `.claude/`, `CLAUDE.md`, `CLAUDE.local.md`, `reports/`, `test-results/` ni ficheros de entorno.
- Si hay cambios que no pertenecen a este trabajo, déjalos fuera y dilo.
- Si no queda nada que commitear, no crees un commit vacío: repórtalo.

## 3. Mensaje

El estilo del repo: español, imperativo, primera letra en mayúscula, sin punto final y sin prefijos tipo `feat:`. Por ejemplo: `Añadir contexto del proyecto`, `Gate de riesgo CRAP` o `Montar harness`.

- **Título**: 72 caracteres como máximo y dice **qué** cambia.
- **Cuerpo** (opcional, tras una línea en blanco): el **porqué**, si no es obvio.
- Última línea: el trailer de co-autoría que indique la sesión, si lo hay.

Usa un heredoc para que el formato no se rompa:

```bash
git commit -F - <<'MSG'
Añadir tabla de efectividad entre tipos

<porqué, si hace falta>

Co-Authored-By: …
MSG
```

## 4. Si el pre-commit falla

El hook ejecuta typecheck, eslint, stylelint, cspell y los tests relacionados con lo que hay en stage. Si falla:

- Lee el error, arregla la causa, vuelve a meter los ficheros en stage y crea el commit de nuevo.
- **Nunca** uses `--no-verify` ni desactives una regla para que pase.
- En el workflow, si no es un arreglo trivial (una palabra de cspell, un import), no lo arregles tú: reporta `committed: false` con el error. Lo arregla el implementador.

## 5. Reglas duras

- Nunca `--amend`, `rebase`, `reset` sobre commits existentes ni `push --force`: puede que ya estén publicados. Se arregla hacia delante, con otro commit.
- No hagas push: eso es de `open-pr`.
