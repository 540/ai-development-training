import { pokemonInfraRepository } from '../Pokemon.infra.repository'
import { PokemonDTO } from '../dto/Pokemon.dto'

const fetchMock = vitest.fn()

const respond = (body: unknown) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)

const pikachuDTO: PokemonDTO = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: { name: 'electric' } }],
  sprites: {
    other: {
      'official-artwork': { front_default: 'pikachu-artwork.png' },
      dream_world: { front_default: 'pikachu-dream.png' },
    },
  },
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
    { base_stat: 40, stat: { name: 'defense' } },
    { base_stat: 50, stat: { name: 'special-attack' } },
    { base_stat: 50, stat: { name: 'special-defense' } },
    { base_stat: 90, stat: { name: 'speed' } },
  ],
}

describe('pokemonInfraRepository', () => {
  beforeEach(() => {
    globalThis.fetch = fetchMock
    vitest.clearAllMocks()
  })

  it('asks PokéAPI for the range of the generation', async () => {
    fetchMock.mockReturnValueOnce(respond({ results: [] }))

    await pokemonInfraRepository.listByGeneration('Johto')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://pokeapi.co/api/v2/pokemon?offset=151&limit=100'
    )
  })

  it('lists the pokemons of a generation', async () => {
    fetchMock
      .mockReturnValueOnce(
        respond({
          results: [
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
          ],
        })
      )
      .mockReturnValueOnce(respond(pikachuDTO))

    const pokemons = await pokemonInfraRepository.listByGeneration('Kanto')

    expect(pokemons.map(({ name }) => name)).toEqual(['pikachu'])
  })

  it('finds a pokemon by its id', async () => {
    fetchMock.mockReturnValueOnce(respond(pikachuDTO))

    const pokemon = await pokemonInfraRepository.findById('25')

    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/25')
    expect(pokemon.types).toEqual(['electric'])
  })

  it('fails when PokéAPI does not answer ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response)

    await expect(pokemonInfraRepository.findById('999')).rejects.toThrow()
  })
})
