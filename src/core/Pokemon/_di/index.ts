import { setPokemonRepository } from '@/core/Pokemon/services/Pokemon.service'
import { pokemonInfraRepository } from '@/core/Pokemon/infrastructure/Pokemon.infra.repository'

export const injectPokemonDependencies = () => {
  setPokemonRepository(pokemonInfraRepository)
}
