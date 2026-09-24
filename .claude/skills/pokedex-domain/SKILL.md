---
name: pokedex-domain
description: Conocimiento del dominio de la Pokédex (generaciones, los 18 tipos y la tabla de efectividad) y dónde vive cada pieza en src/core. Precárgala antes de planificar, implementar o revisar cualquier cambio que toque Pokémon, tipos, generaciones o efectividad.
user-invocable: false
---

# Dominio de la Pokédex

La fuente de verdad del negocio es `CONTEXT.md`, en la raíz. Esta skill te dice cómo usarla, no la sustituye.

## Reglas

1. **Lee la sección de `CONTEXT.md` que toque antes de escribir código.** Si el cambio tiene que ver con tipos o efectividad, lee la tabla completa del tipo atacante afectado. Nunca la reconstruyas de memoria: la tabla vigente es la de la sexta generación en adelante (con `fairy`), y las versiones antiguas que conoces de otras fuentes son distintas.
2. **Los tipos se nombran siempre por su identificador en inglés de PokéAPI** (`fire`, `water`, `fairy`…). El nombre en español es solo documentación.
3. **Efectividad**: ×2 muy eficaz, ×0,5 poco eficaz, ×0 sin efecto y ×1 cualquier combinación que no aparezca en la tabla. Contra dos tipos, los multiplicadores se multiplican entre sí (×4, ×0,25 o ×0 son posibles). Un test que solo comprueba ×2 y ×0,5 no cubre la regla.
4. **Generaciones**: son nueve, de Kanto a Paldea, y cada una es un rango de la Pokédex nacional. Los rangos viven en `GENERATION_RANGES` de `src/core/Pokemon/infrastructure/Pokemon.infra.repository.ts`, y el tipo `PokemonGeneration` en el dominio.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Modelo (`Pokemon`, `PokemonGeneration`) | `src/core/Pokemon/domain/Pokemon.ts` |
| Tipos (`PokemonType`) | `src/core/Pokemon/domain/PokemonType.ts` |
| Contrato del repositorio | `src/core/Pokemon/domain/PokemonRepository.ts` |
| Acceso a PokéAPI, DTO y mapper | `src/core/Pokemon/infrastructure/` |
| Lo que la UI puede pedir | `src/core/Pokemon/services/Pokemon.service.ts` (`pokemonService`) |
| Cableado repositorio → servicio | `src/core/Pokemon/_di/` y `src/di/` |

La **lógica de negocio pura** (por ejemplo, calcular la efectividad) va en `domain/`, sin dependencias de otras capas. Dominio y servicios se miden al 100 % de cobertura y de mutantes muertos, así que cada regla necesita un test que la defienda.
