# Pokédex

Pokédex sobre PokéAPI en React y TypeScript: listado por generación con buscador y filtros, y ficha de cada Pokémon.

## Arrancar

```bash
pnpm install
pnpm dev
```

## Cómo está organizado

- `src/core/Pokemon/domain` — el modelo (`Pokemon`, `PokemonType`) y el contrato del repositorio.
- `src/core/Pokemon/infrastructure` — el acceso a PokéAPI: el repositorio, los DTO y su conversión al modelo.
- `src/core/Pokemon/services` — lo que la interfaz puede pedir: `pokemonService`.
- `src/ui` — la interfaz en React: vistas, componentes, rutas y estilos.
- `src/di` — conecta el repositorio con el servicio al arrancar.

## Dominio

El conocimiento del negocio (generaciones, tipos y su efectividad) está en `CONTEXT.md`. Léelo antes de tocar cualquier cosa que tenga que ver con los tipos.
