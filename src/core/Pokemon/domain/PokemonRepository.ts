import { Pokemon, PokemonGeneration } from './Pokemon'

export interface PokemonRepository {
  listByGeneration: (generation: PokemonGeneration) => Promise<Pokemon[]>
  findById: (id: string) => Promise<Pokemon>
}
