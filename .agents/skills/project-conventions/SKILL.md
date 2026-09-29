---
name: project-conventions
description: Convenciones de código del comparador de coches (capas, vehicleService, textos en src/ui/texts, CSS modules con variables, tests con Vitest y Testing Library, sin any) y qué gate ejecutar en cada momento. Precárgala antes de escribir o modificar código de src/.
user-invocable: false
---

# Convenciones del comparador de coches

Las reglas del proyecto están en `AGENTS.md`. Esta skill las traduce a lo que tienes que hacer al escribir código.

## Capas (dependency-cruiser las hace cumplir)

- `domain/` no importa nada de otras capas.
- `services/` solo conoce el dominio. La infraestructura se enchufa desde `src/core/Vehicle/_di/`.
- `src/ui/` **nunca** importa de `infrastructure/` ni llama a `fetch`: pide los datos a `vehicleService`. Si necesitas un dato nuevo, añádelo en este orden: campo en `domain/Vehicle.ts` → DTO y `buildVehicle` en `infrastructure/` → método en `vehicleService` si hace falta una consulta nueva.
- Nada de ciclos ni de módulos huérfanos: un fichero que nadie importa rompe `pnpm arch`.

## Código

- Nombres: camelCase para variables y funciones, PascalCase para componentes y tipos, MAYÚSCULAS para constantes. Código y comentarios en inglés (cspell lo revisa; si un nombre propio legítimo falla, añádelo a `cspell.json`).
- **Textos de pantalla en castellano y solo en `src/ui/texts/`**: `texts.ts` para los de la interfaz y `labels.ts` para traducir los valores que la API manda en inglés. Un texto en castellano en cualquier otro fichero rompe `pnpm spell`.
- Números con los formateadores de `src/ui/utils/format.ts` (coma decimal, consumos con un decimal).
- Nada de `any`.
- Estilos en CSS modules (`Component.module.css`) con clases en camelCase. **Nada de colores en crudo**: usa las variables de `src/ui/styles/globals.css` y, si falta un color, añádelo allí. Desde TypeScript, los colores salen de `src/ui/styles/utils/colors.ts`.
- Componentes: carpeta propia con `Component.tsx`, `Component.module.css` e `index.ts`. Los subcomponentes privados de una vista van en `_components/` y sus hooks en `_hooks/`. Lo compartido entre vistas va en `src/ui/components/`.
- Rutas: `src/ui/router/paths.ts` y `routes.ts`, con `detailsPath(id)` para la ficha.
- La lista de comparación vive en `useCompare` (`src/ui/hooks/compare/`), guardada en `localStorage`.

## Tests

- Vitest + Testing Library, en `__tests__/` junto al código.
- Para la UI, usa `render` de `@/test/utils/render` (envuelve en `MemoryRouter` y `CompareProvider`) y mockea la API con `mockFuelEconomyApi` de `@/test/utils/fuelEconomyApi`. Las fixtures (`camryDTO`, `priusPrimeDTO`, `bz4xDTO` y sus versiones ya construidas) están en `@/test/fixtures`; amplíalas allí si necesitas otro coche.
- Los textos esperados se leen de `TEXTS` y `labels`, no se escriben a mano.
- Aserciones de comportamiento visible (`screen.getByText`, `getByRole`), no de detalles de implementación. ESLint prohíbe los tests enfocados, desactivados y sin aserción.
- Umbrales de cobertura: 100 % en dominio y servicios, 90 % en infraestructura y 60 % en la UI. Stryker muta dominio y servicios y exige el 100 % de mutantes muertos: prueba los límites (`>` frente a `>=`) y cada rama.

## Gates

| Momento | Comando |
|---|---|
| Tras cada edición | El hook PostToolUse ya lanza eslint, stylelint y cspell sobre el fichero |
| Antes de dar la tarea por terminada | `pnpm check` (tipos, lint, estilos, idioma, arquitectura y tests) |
| Antes de publicar | `pnpm verify` (lo anterior + duplicación, cobertura y CRAP) |
| Mutación | `pnpm mutation`, o acotada: `pnpm exec stryker run --mutate <ficheros>` |

Arregla la causa. Nunca desactives una regla, ni pongas `eslint-disable` o `@ts-ignore`, ni saltes un hook con `--no-verify`.
