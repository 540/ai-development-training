import { describe, expect, it } from 'vitest'
import { pokedexNumberOf } from '../../src/domain/pokedex-number'

describe('el número de Pokédex', () => {
  it.each([
    { pokedexId: 1, pokedexNumber: '#001' },
    { pokedexId: 25, pokedexNumber: '#025' },
    { pokedexId: 99, pokedexNumber: '#099' },
    { pokedexId: 100, pokedexNumber: '#100' },
    { pokedexId: 151, pokedexNumber: '#151' },
  ])('se escribe $pokedexNumber para el $pokedexId', ({ pokedexId, pokedexNumber }) => {
    expect(pokedexNumberOf(pokedexId)).toBe(pokedexNumber)
  })
})
