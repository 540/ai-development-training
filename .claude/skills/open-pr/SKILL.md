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

## 3. Cuerpo

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

| AC1 — … | AC2 — … |
|---|---|
| ![AC1](.claude/tmp/<slug>/shots/ac1.png) | ![AC2](.claude/tmp/<slug>/shots/ac2.png) |

## Salvedades
<supuestos del plan, hallazgos aplazados, dudas para quien revisa, criterios fallidos. Si no hay ninguna: "Ninguna.">

## Cómo probarlo
pnpm install && pnpm dev   # y los pasos para ver el cambio
```

**Nunca afirmes que algo ha pasado si no lo ha hecho.** Si un gate, la revisión o el navegador no llegaron a ejecutarse, dilo. Si no hay capturas, quita la tabla y dilo en **Navegador**.

Termina el cuerpo con la línea de atribución que indique la sesión, si la hay.

## 4. Crear la PR con las capturas adjuntas

Las capturas se suben con `--attach` de `gh` (versión 2.99 o superior; el preflight lo comprueba):

```bash
gh pr create --draft --base <base> --head <rama> --title "<título>" --body-file <fichero> \
  --attach '.claude/tmp/<slug>/shots/ac1.png#AC1 — <criterio>' \
  --attach '.claude/tmp/<slug>/shots/ac2.png#AC2 — <criterio>'
```

Cómo funciona:

- `gh` sube cada fichero como **adjunto de GitHub** (`https://github.com/user-attachments/assets/…`), igual que al arrastrar una imagen en la web. No se sube nada a git, ni ramas ni commits, y el pre-push no interviene.
- Si el cuerpo contiene una referencia `![alt](ruta)` cuya ruta es **exactamente** la misma cadena que la de un `--attach`, `gh` la reescribe con la URL del adjunto. Por eso se pone la tabla del cuerpo con las rutas tal cual, y en `--attach` se pasa la misma ruta. Una ruta distinta (absoluta en un lado y relativa en el otro) no se reescribe.
- Un adjunto que el cuerpo no referencia se añade al final.
- Lo que va detrás de `#` es el texto alternativo. Por eso la ruta no puede contener `#`. Si la referencia del cuerpo ya lleva texto alternativo, se queda el del cuerpo.
- Como máximo, 50 ficheros por comando.
- Si falla algún adjunto, la PR se crea igual con los que sí se han subido: `gh` sale con error pero imprime la URL. Compruébala y apunta en **Salvedades** qué captura falta.

Para añadir capturas a una PR que ya existe, usa `gh pr edit <pr> --attach …`. Sin `--body-file`, conserva el cuerpo y añade las imágenes al final.

El título sigue el estilo de los commits: español, imperativo y sin prefijo. Después comprueba la PR con `gh pr view --json url,isDraft,baseRefName,body` y que en el cuerpo no queda ninguna referencia a `.claude/tmp/`.

## 5. Si algo se deniega o falla

Si un comando se rechaza por permisos o falla, **no lo reintentes ni busques otra forma de hacerlo**. Para y reporta el comando literal y el error.
