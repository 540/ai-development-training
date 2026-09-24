# Pokédex

Pokédex sobre PokéAPI en React y TypeScript: listado por generación con buscador y filtros, y ficha de cada Pokémon.

## Reglas del proyecto

- Nombres: camelCase para variables y funciones, PascalCase para componentes y tipos, MAYÚSCULAS para constantes. Ficheros en camelCase o PascalCase, y clases CSS en camelCase.
- El código va en inglés: nombres, comentarios y textos de pantalla.
- Las vistas no llaman a la API: los datos se piden a `pokemonService`, y si hace falta algo nuevo se añade al repositorio y al servicio. El dominio no depende de otras capas.
- Nada de `any`.
- Nada de colores en crudo: se usan las variables de `src/ui/styles/globals.css`, y si hace falta uno nuevo se añade allí.
- Antes de dar una tarea por terminada, `pnpm verify` tiene que pasar.

## Dominio

El conocimiento del negocio (generaciones, tipos y su efectividad) está en `CONTEXT.md`. Léelo antes de tocar cualquier cosa que tenga que ver con los tipos.
