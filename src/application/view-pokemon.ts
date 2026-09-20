import { pokedexNumberOf } from '../domain/pokedex-number'
import { displayNameOf } from '../domain/pokemon-name'
import type { PokemonRepository } from '../domain/pokemon-repository'

export type PokemonView = {
  pokedexNumber: string
  name: string
  frontImageUrl: string
}

export async function viewPokemon(
  repository: PokemonRepository,
  pokedexId: number,
): Promise<PokemonView> {
  const pokemon = await repository.findByPokedexId(pokedexId)

  return {
    pokedexNumber: pokedexNumberOf(pokemon.pokedexId),
    name: displayNameOf(pokemon.apiName),
    frontImageUrl: pokemon.frontImageUrl,
  }
}
