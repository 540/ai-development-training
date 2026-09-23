import { PokemonGeneration } from '../domain/Pokemon'
import { PokemonRepository } from '../domain/PokemonRepository'
import { PokemonDTO, PokemonSimplifiedDTO } from './dto/Pokemon.dto'
import { buildPokemon } from './mappers/buildPokemon'

const POKE_API_URL = 'https://pokeapi.co/api/v2'

const GENERATION_RANGES: Record<
  PokemonGeneration,
  { offset: number; limit: number }
> = {
  Kanto: { offset: 0, limit: 151 },
  Johto: { offset: 151, limit: 100 },
  Hoenn: { offset: 251, limit: 135 },
  Sinnoh: { offset: 386, limit: 107 },
  Unova: { offset: 493, limit: 156 },
  Kalos: { offset: 649, limit: 72 },
  Alola: { offset: 721, limit: 88 },
  Galar: { offset: 809, limit: 96 },
  Paldea: { offset: 905, limit: 120 },
}

const getJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Error fetching ${url}`)
  }

  return response.json()
}

export const pokemonInfraRepository: PokemonRepository = {
  listByGeneration: async (generation) => {
    const { offset, limit } = GENERATION_RANGES[generation]
    const { results } = await getJSON<{ results: PokemonSimplifiedDTO[] }>(
      `${POKE_API_URL}/pokemon?offset=${offset}&limit=${limit}`
    )
    const pokemonsDTO = await Promise.all(
      results.map(({ url }) => getJSON<PokemonDTO>(url))
    )

    return pokemonsDTO.map(buildPokemon)
  },
  findById: async (id) => {
    const pokemonDTO = await getJSON<PokemonDTO>(`${POKE_API_URL}/pokemon/${id}`)

    return buildPokemon(pokemonDTO)
  },
}
