---
name: open-pr
description: Publica la rama de feature de la Pokédex y abre una PR en borrador contra harness, con resumen, criterios de aceptación, resultado de gates y revisión, salvedades y capturas del navegador. No escribe código ni ejecuta tests. Úsala cuando el trabajo esté commiteado y quieras abrir la PR.
argument-hint: "[base, por defecto harness]"
---

# Abrir la PR

## 1. Comprobaciones

```bash
git branch --show-current          # nunca harness, version-final ni main
git status --short                 # si queda algo sin commitear, usa antes la skill commit
git log --oneline <base>..HEAD     # tiene que haber al menos un commit
gh pr view --json url -q .url      # si ya hay PR para esta rama, actualízala en vez de crear otra
```

## 2. Push

```bash
git push -u origin <rama>
```

El pre-push ejecuta `pnpm verify`. **Nunca `--no-verify` ni `--force`.** Si falla, para y reporta el error literal: no lo arregles aquí.

## 3. Capturas (si las hay)

```bash
sh .claude/skills/open-pr/scripts/publish-screenshots.sh <rama> <png> [<png> …]
```

Sube los PNG a la rama huérfana `pr-assets` (en `<rama>/`) sin tocar tu working tree, e imprime una línea markdown `![acN](…)` por captura. Pégalas en la sección de verificación. Si falla, abre la PR igual y lista las rutas locales.

## 4. Cuerpo

Escríbelo en un fichero (`.claude/tmp/<slug>/pr-body.md`) y pásalo con `--body-file`. En español:

```markdown
## Qué cambia
<2-4 líneas: el objetivo y el enfoque>

## Criterios de aceptación
- [x] AC1 — … (verificado en navegador / por test / por revisión)
- [ ] AC2 — … ❌ <por qué no se cumple>

## Verificación
- **Gates**: check ✅ · duplicación ✅ · cobertura ✅ · CRAP ✅ · mutación ✅/⏭
- **Revisión**: Merge Safety X.X/10 tras N rondas (Corrección x · Arquitectura x · Dominio x · Tests x · UI x)
- **Navegador**: pass / fail / no aplica (motivo)

<capturas>

## Salvedades
<supuestos del plan, hallazgos aplazados, dudas para quien revisa, criterios fallidos. Si no hay ninguna: "Ninguna.">

## Cómo probarlo
pnpm install && pnpm dev   # y los pasos para ver el cambio
```

**Nunca afirmes que algo ha pasado si no lo ha hecho.** Si un gate, la revisión o el navegador no llegaron a ejecutarse, dilo.

Termina el cuerpo con la línea de atribución que indique la sesión, si la hay.

## 5. Crear la PR

```bash
gh pr create --draft --base <base> --head <rama> --title "<título>" --body-file <fichero>
```

El título sigue el estilo de los commits: español, imperativo y sin prefijo. Después comprueba la PR con `gh pr view --json url,isDraft,baseRefName`.

## 6. Si algo se deniega o falla

Si un comando se rechaza por permisos o falla, **no lo reintentes ni busques otra forma de hacerlo**. Para y reporta el comando literal y el error.
