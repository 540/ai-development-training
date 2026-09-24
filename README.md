# Pokédex — especificación

Pokédex sobre [PokéAPI](https://pokeapi.co): listado por generación con buscador y filtros, y ficha de cada Pokémon. Adaptada de [pokedex-taller-scpna](https://github.com/Endikaorve/pokedex-taller-scpna), de Endika Orve, con su permiso.

La app es el pretexto. Esta rama trae los criterios del equipo automatizados con herramientas estándar, para que el agente los cumpla sin que nadie tenga que repetírselos, y el conocimiento del negocio en `CONTEXT.md`.

## Los guardarraíles

| guardarraíl | herramienta | qué exige |
|---|---|---|
| tipos | TypeScript | el proyecto compila |
| nombres | ESLint: `naming-convention` y `unicorn/filename-case` | camelCase; PascalCase para componentes y tipos; MAYÚSCULAS para constantes; ficheros en camelCase o PascalCase |
| clases CSS | Stylelint | camelCase, sin guiones |
| sin `any` | ESLint: `no-explicit-any` | todo tipado |
| colores | Stylelint y ESLint | solo las variables de `src/ui/styles/globals.css` |
| idioma | cspell | el código en inglés |
| arquitectura | dependency-cruiser y ESLint | las vistas no llaman a la API ni importan infraestructura; el dominio no depende de nadie; sin ciclos ni huérfanos |
| tests | Vitest y Testing Library | la suite pasa |

## Cómo se ejecuta

```bash
pnpm install   # instala también los hooks de git
pnpm verify    # todos los guardarraíles
```

Cada uno por separado:

```bash
pnpm typecheck   pnpm lint   pnpm lint:css   pnpm spell   pnpm arch   pnpm test
```

### Cuándo corren

- **Mientras el agente trabaja**: después de cada edición, ESLint, Stylelint y cspell revisan ese fichero y le devuelven los errores para que los corrija; al terminar, `pnpm verify`. Configurado para Claude Code (`.claude/`), Codex (`.codex/`), Cursor (`.cursor/`) y Copilot (`.github/hooks/`). Antigravity (`.agents/`) solo puede revisar al terminar.
- **pre-commit**: tipos, lint, estilos, idioma y los tests relacionados con lo modificado.
- **pre-push**: `pnpm verify`.

Los hooks de git están en `.githooks/` y se instalan solos al instalar dependencias.

## Práctica

Esta vez no se implementa: se especifica. Antes de empezar, instala las skills de interrogatorio:

```bash
npx skills@latest add mattpocock/skills --skill grill-me grilling
```

1. **A pelo.** Lanza el prompt y pide los criterios de aceptación con los que darías la tarea por terminada. Sin implementar.
2. **Interrogatorio.** En sesión nueva, lanza `/grill-me` con el mismo prompt hasta que pueda escribir los criterios de aceptación. Contesta tú como negocio.
3. **Cotejo.** ¿Qué salió solo en la segunda vuelta? ¿Estaba escrito en algún sitio?

> Añade al proyecto web una tabla interactiva con las ventajas y desventajas entre todos los tipos de Pokémon.
