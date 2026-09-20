import type { Pokemon } from '../domain/pokemon'

export type PokemonRepository = {
  findByPokedexId: (pokedexId: number) => Promise<Pokemon>
}
