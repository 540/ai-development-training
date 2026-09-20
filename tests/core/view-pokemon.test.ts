import { describe, expect, it } from 'vitest'
import { viewPokemon } from '../../src/application/view-pokemon'
import type { PokemonRepository } from '../../src/domain/pokemon-repository'

const kantoRepository: PokemonRepository = {
  findByPokedexId: async (pokedexId) => ({
    pokedexId,
    apiName: 'nidoran-f',
    frontImageUrl: `https://sprites.test/${pokedexId}.png`,
  }),
}

describe('la vista de un Pokémon', () => {
  it('compone número, nombre e imagen a partir del Pokémon pedido', async () => {
    expect(await viewPokemon(kantoRepository, 29)).toEqual({
      pokedexNumber: '#029',
      name: 'Nidoran-f',
      frontImageUrl: 'https://sprites.test/29.png',
    })
  })
})
