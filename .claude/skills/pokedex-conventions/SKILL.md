---
name: pokedex-conventions
description: Convenciones de código de la Pokédex (capas, pokemonService, CSS modules con variables, tests con Vitest y Testing Library, sin any) y qué gate ejecutar en cada momento. Precárgala antes de escribir o modificar código de src/.
user-invocable: false
---

# Convenciones de la Pokédex

Las reglas del proyecto están en `AGENTS.md`. Esta skill las traduce a lo que tienes que hacer al escribir código.

## Capas (dependency-cruiser las hace cumplir)

- `domain/` no importa nada de otras capas.
- `services/` solo conoce el dominio. La infraestructura se enchufa desde `src/core/Pokemon/_di/`.
- `src/ui/` **nunca** importa de `infrastructure/` ni llama a `fetch`: pide los datos a `pokemonService`. Si necesitas un dato nuevo, añádelo en este orden: contrato en `domain/PokemonRepository.ts` → implementación en `infrastructure/` → método en `pokemonService`.
- Nada de ciclos ni de módulos huérfanos: un fichero que nadie importa rompe `pnpm arch`.

## Código

- Nombres: camelCase para variables y funciones, PascalCase para componentes y tipos, MAYÚSCULAS para constantes. Todo en inglés, también los textos de pantalla (cspell lo revisa; si un nombre propio legítimo falla, añádelo a `cspell.json`).
- Nada de `any`.
- Estilos en CSS modules (`Component.module.css`) con clases en camelCase. **Nada de colores en crudo**: usa las variables de `src/ui/styles/globals.css` y, si falta un color, añádelo allí.
- Componentes: carpeta propia con `Component.tsx`, `Component.module.css` e `index.ts`. Los subcomponentes privados de una vista van en `_components/` y sus hooks en `_hooks/`.
- Rutas: `src/ui/router/paths.ts` y `routes.ts`, con `createPath` para construir URLs.

## Tests

- Vitest + Testing Library, en `__tests__/` junto al código.
- Para la UI, usa `render` de `@/test/utils` (envuelve en `MemoryRouter`) y mockea la red con `fakePokeApi` de `@/test/pokeApi` asignándolo a `globalThis.fetch`. Si necesitas más Pokémon de prueba, amplía `POKEMONS` allí.
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
