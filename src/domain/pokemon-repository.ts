import type { Pokemon } from './pokemon'

export type PokemonRepository = {
  findByPokedexId: (pokedexId: number) => Promise<Pokemon>
}
