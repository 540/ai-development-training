---
name: verify-browser
description: Verifica criterios de aceptación de la Pokédex navegando de verdad en Chromium con Playwright. Escribe un spec desechable por criterio en .claude/tmp, mockea PokéAPI con page.route, levanta la app con pnpm dev, saca una captura por criterio y clasifica cada fallo (verificador, entorno o criterio). Úsala para comprobar en el navegador que un cambio visible funciona, antes de abrir una PR o después de implementar.
argument-hint: "<criterios de aceptación o ruta al plan>"
---

# Verificación en navegador

Los specs son **desechables**: viven en `.claude/tmp/` (ignorado por git), no pasan por los gates y nunca entran en la PR. Sirven como evidencia, no como tests de regresión.

## 1. Carpeta de trabajo

- En el workflow, te pasan el `slug`: la carpeta es `.claude/tmp/<slug>/`.
- A mano, usa `.claude/tmp/manual-<kebab-del-cambio>/`.

Dentro:

```
.claude/tmp/<slug>/
  e2e/criteria.spec.ts   ← un test por criterio
  shots/ac1.png …        ← una captura por criterio
```

La profundidad es fija: desde `e2e/`, el helper de mocks está en `../../../skills/verify-browser/support/pokeApi`.

## 2. Antes de escribir

1. Lee los criterios. Si te dan un plan, léelo entero.
2. Lee los componentes afectados para saber **qué texto, rol o placeholder** tiene cada elemento. Usa, por este orden, `getByRole`, `getByText`, `getByPlaceholder` o `getByLabel`. No uses clases CSS (son de CSS modules, con hash).
3. Rutas: `/` es el listado (selector de generación, buscador y filtros por estadística) y `/:id` es la ficha. Las nuevas están en `src/ui/router/paths.ts`.

## 3. Mock de PokéAPI

**Siempre mockeado, nunca contra la red.** El helper reutiliza las fixtures de `src/test/pokeApi.ts`:

```ts
import { expect, test } from '@playwright/test'

import { mockPokeApi, pokemonDTO, POKEMONS } from '../../../skills/verify-browser/support/pokeApi'

test.beforeEach(async ({ page }) => {
  await mockPokeApi(page, [
    ...POKEMONS, // pikachu (25, electric) y charmander (4, fire)
    pokemonDTO(6, 'charizard', ['fire', 'flying'], { attack: 84 }),
  ])
})
```

- `pokemonDTO(id, name, types, stats?)` crea el Pokémon que necesites. Hazlo **dentro del spec** y no toques `src/test/`.
- `mockPokeApi` responde a la lista de cualquier generación y a `/pokemon/:id`, y sirve un sprite de relleno. Cualquier otra ruta de PokéAPI devuelve 404 con `Not mocked: <ruta>`. Si la app pide un endpoint nuevo, añade un `page.route` propio en el spec **antes** de `mockPokeApi`.

## 4. Un test por criterio

```ts
test('AC1 — <texto corto del criterio>', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder('Filter by name or type').fill('fire')
  await expect(page.getByText(/charmander/i)).toBeVisible()
  await expect(page.getByText(/pikachu/i)).toHaveCount(0)
  await page.screenshot({ path: '.claude/tmp/<slug>/shots/ac1.png', fullPage: true })
})
```

- El nombre empieza por `ACn —`, con la numeración de los criterios.
- **Aserción con `expect` antes de la captura**: la captura es evidencia, no la verificación.
- Un criterio no verificable en el navegador (por ejemplo, "hay tests") se marca `skipped` en el informe y no lleva spec.

## 5. Ejecutar

```bash
pnpm e2e .claude/tmp/<slug>
```

Playwright levanta la app en el puerto 5199 (`webServer` en `playwright.config.ts`) y la reutiliza si ya está levantada. Tarda segundos.

**Si te piden repetir la verificación (ronda 2 o posterior) y los specs ya existen, no los reescribas**: ejecútalos. Solo tócalos si el fallo es del verificador.

## 6. Clasificar cada fallo

| Clase | Síntoma | Qué haces |
|---|---|---|
| `verifier` | Selector que no existe pero el elemento sí se ve en la captura o el trace, fixture insuficiente, ruta no mockeada, timing | Arreglas el spec y repites. **Máximo 2 intentos**; después lo reportas como `verifier` |
| `environment` | Chromium no instalado, el puerto 5199 ocupado por otra cosa, `pnpm dev` no arranca, error de compilación de Vite | No lo arreglas: lo reportas con el error literal |
| `criterion` | La app hace otra cosa distinta a lo que pide el criterio | No tocas el código de la app: lo reportas con lo observado, lo esperado y la captura |

Para decidir entre `verifier` y `criterion`, mira la captura o el trace (`.claude/tmp/playwright-results/`). Si la app muestra lo que pide el criterio y tu selector no lo encuentra, el fallo es tuyo.

**Nunca edites código de `src/`.** Tu trabajo es verificar, no arreglar.

## 7. Informe

Por cada criterio: `ac`, `result` (`pass`, `fail` o `skipped`), `classification` (`pass`, `verifier`, `environment` o `criterion`), `observed`, `expected` y `screenshot` (ruta absoluta). A mano, preséntalo como tabla y enseña las capturas con Read.
