import { POKEMON_GENERATIONS } from '../Pokemon'
import { POKEMON_TYPES } from '../PokemonType'

describe('the Pokémon domain', () => {
  it('knows the eighteen types', () => {
    expect(POKEMON_TYPES).toEqual([
      'bug',
      'dark',
      'dragon',
      'electric',
      'fairy',
      'fighting',
      'fire',
      'flying',
      'ghost',
      'grass',
      'ground',
      'ice',
      'normal',
      'poison',
      'psychic',
      'rock',
      'steel',
      'water',
    ])
  })

  it('knows the nine generations in order', () => {
    expect(POKEMON_GENERATIONS).toEqual([
      'Kanto',
      'Johto',
      'Hoenn',
      'Sinnoh',
      'Unova',
      'Kalos',
      'Alola',
      'Galar',
      'Paldea',
    ])
  })
})
