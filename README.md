# Comparador de coches — con guardarraíles

Comparador de coches sobre la API de [fueleconomy.gov](https://www.fueleconomy.gov/feg/ws/) (EPA): listado por año y marca con buscador y filtros, ficha de cada versión y comparación lado a lado de hasta tres coches.

La app es el pretexto. Esta rama trae el mismo comparador ordenado por capas y los criterios del equipo convertidos en herramientas estándar, para que se puedan comprobar sin que nadie tenga que repetírselos al agente.

## Los guardarraíles

| guardarraíl | herramienta | qué exige |
|---|---|---|
| tipos | TypeScript | el proyecto compila |
| nombres | ESLint: `naming-convention` y `unicorn/filename-case` | camelCase; PascalCase para componentes y tipos; MAYÚSCULAS para constantes; ficheros en camelCase o PascalCase |
| clases CSS | Stylelint | camelCase, sin guiones |
| sin `any` | ESLint: `no-explicit-any` | todo tipado |
| colores | Stylelint y ESLint | solo las variables de `src/ui/styles/globals.css` |
| idioma | cspell | el código en inglés; los textos de pantalla, en castellano y solo en `src/ui/texts/` |
| arquitectura | dependency-cruiser y ESLint | las vistas no llaman a la API ni importan infraestructura; el dominio no depende de nadie; sin ciclos ni huérfanos |
| tests | Vitest y Testing Library | la suite pasa |

## Cómo se ejecuta

```bash
pnpm install
pnpm dev       # la app
pnpm verify    # todos los guardarraíles
```

Cada uno por separado:

```bash
pnpm typecheck   pnpm lint   pnpm lint:css   pnpm spell   pnpm arch   pnpm test
```

## Práctica

Los guardarraíles existen, pero nadie los ejecuta solos: solo corren si alguien lanza `pnpm verify`. La práctica es pensar dónde se puede forzar que se ejecute `pnpm verify` sin que nadie lo pida, y montarlo.

Para probarlo, lanza este prompt a tu agente:

> Añade al comparador cuál de los coches sale más barato en España.
