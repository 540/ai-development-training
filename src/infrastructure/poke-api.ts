import type { Pokemon } from '../domain/pokemon'
import type { PokemonRepository } from '../domain/pokemon-repository'

export const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2'

type PokeApiPokemon = {
  id: number
  name: string
  sprites: {
    front_default: string
  }
}

function toPokemon(payload: PokeApiPokemon): Pokemon {
  return {
    pokedexId: payload.id,
    apiName: payload.name,
    frontImageUrl: payload.sprites.front_default,
  }
}

export function pokeApiPokemonRepository(
  baseUrl: string = POKE_API_BASE_URL,
): PokemonRepository {
  return {
    async findByPokedexId(pokedexId) {
      const response = await fetch(`${baseUrl}/pokemon/${pokedexId}`)

      if (!response.ok) {
        throw new Error(`PokéAPI responded with ${response.status}`)
      }

      return toPokemon((await response.json()) as PokeApiPokemon)
    },
  }
}
