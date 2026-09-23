import { PokemonGeneration } from '../domain/Pokemon'
import { PokemonRepository } from '../domain/PokemonRepository'

let pokemonRepository: PokemonRepository

export const pokemonService = {
  listByGeneration: (generation: PokemonGeneration) =>
    pokemonRepository.listByGeneration(generation),
  findById: (id: string) => pokemonRepository.findById(id),
}

export const setPokemonRepository = (repository: PokemonRepository) => {
  pokemonRepository = repository
}
