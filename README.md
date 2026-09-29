# Comparador de coches — especificación

Comparador de coches sobre la API de [fueleconomy.gov](https://www.fueleconomy.gov/feg/ws/) (EPA): listado por año y marca con buscador y filtros, ficha de cada versión y comparación lado a lado de hasta tres coches.

La app es el pretexto. Esta rama trae el mismo comparador ordenado por capas, los criterios del equipo convertidos en herramientas estándar y el conocimiento de la API y del negocio en `CONTEXT.md`.

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

Esta vez no se implementa: se especifica. Antes de empezar, instala las skills de interrogatorio:

```bash
npx skills@latest add mattpocock/skills --skill grill-me grilling
```

1. **A pelo.** Lanza el prompt y pide los criterios de aceptación con los que darías la tarea por terminada. Sin implementar.
2. **Interrogatorio.** En sesión nueva, lanza `/grill-me` con el mismo prompt hasta que pueda escribir los criterios de aceptación. Contesta tú como negocio.
3. **Cotejo.** ¿Qué salió solo en la segunda vuelta? ¿Estaba escrito en algún sitio?

> Añade al comparador cuál de los coches sale más barato en España.
