import { Pokemon } from '@/core/Pokemon/domain/Pokemon'
import { PokemonRepository } from '@/core/Pokemon/domain/PokemonRepository'
import { injectPokemonDependencies } from '@/core/Pokemon/_di'
import { pokemonService, setPokemonRepository } from '../Pokemon.service'

const pikachu: Pokemon = {
  id: '25',
  name: 'pikachu',
  height: 0.4,
  weight: 6,
  types: ['electric'],
  images: { main: 'pikachu-artwork.png', alt: 'pikachu-dream.png' },
  stats: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90,
  },
}

const repository: PokemonRepository = {
  listByGeneration: vitest.fn().mockResolvedValue([pikachu]),
  findById: vitest.fn().mockResolvedValue(pikachu),
}

describe('pokemonService', () => {
  beforeEach(() => {
    setPokemonRepository(repository)
  })

  afterAll(() => {
    injectPokemonDependencies()
  })

  it('lists the pokemons of a generation through the repository', async () => {
    const pokemons = await pokemonService.listByGeneration('Kanto')

    expect(repository.listByGeneration).toHaveBeenCalledWith('Kanto')
    expect(pokemons).toEqual([pikachu])
  })

  it('finds a pokemon through the repository', async () => {
    const pokemon = await pokemonService.findById('25')

    expect(repository.findById).toHaveBeenCalledWith('25')
    expect(pokemon).toEqual(pikachu)
  })
})
