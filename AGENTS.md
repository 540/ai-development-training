# Comparador de coches

Comparador de coches sobre la API de fueleconomy.gov en React y TypeScript: listado por año y marca con buscador y filtros, ficha de cada versión y comparación de hasta tres coches.

## Dominio

Lo que hay que saber de la API y del negocio (unidades, combustibles y lo que la API no da) está en `CONTEXT.md`. Léelo antes de tocar cualquier cosa que use consumos, emisiones, costes o datos de la API.

## Reglas del proyecto

- Nombres: camelCase para variables y funciones, PascalCase para componentes y tipos, MAYÚSCULAS para constantes. Ficheros en camelCase o PascalCase, y clases CSS en camelCase.
- El código va en inglés: nombres y comentarios. Los textos de pantalla van en castellano y viven en `src/ui/texts/`.
- Las vistas no llaman a la API: los datos se piden a `vehicleService`, y si hace falta algo nuevo se añade al repositorio y al servicio. El dominio no depende de otras capas.
- Nada de `any`.
- Nada de colores en crudo: se usan las variables de `src/ui/styles/globals.css`, y si hace falta uno nuevo se añade allí.
- Antes de dar una tarea por terminada, `pnpm verify` tiene que pasar.
