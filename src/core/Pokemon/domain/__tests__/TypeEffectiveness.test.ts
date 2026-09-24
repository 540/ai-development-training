import { POKEMON_TYPES, PokemonType } from '../PokemonType'
import {
  MAX_DEFENDING_TYPES,
  TYPE_EFFECTIVENESS,
  getEffectiveness,
} from '../TypeEffectiveness'

// One row per attacker and one column per defender, both in POKEMON_TYPES
// order. '+' is ×2, '-' is ×0.5, '0' is ×0 and '.' is ×1.
const CHART: Record<PokemonType, string> = {
  bug: '.+..-----+...-+.-.',
  dark: '.-..--..+.....+...',
  dragon: '..+.0...........-.',
  electric: '..--...+.-0......+',
  fairy: '.++..+-......-..-.',
  fighting: '-+..-..-0..++--++.',
  fire: '+.-...-..+.+...-++',
  flying: '+..-.+...+.....--.',
  ghost: '.-......+...0.+...',
  grass: '-.-...--.-+..-.+-+',
  ground: '-..+..+0.-...+.++.',
  ice: '..+...-+.++-....--',
  normal: '........0......--.',
  poison: '....+...-+-..-.-0.',
  psychic: '.0...+.......+-.-.',
  rock: '+....-++..-+....-.',
  steel: '...-+.-....+...+--',
  water: '..-...+..-+....+.-',
}

const MULTIPLIERS: Record<string, number> = {
  '+': 2,
  '-': 0.5,
  '0': 0,
  '.': 1,
}

describe('the type effectiveness', () => {
  it.each(POKEMON_TYPES)(
    'knows how %s attacks every single type',
    (attacker) => {
      const expected = [...CHART[attacker]].map((code) => MULTIPLIERS[code])

      const actual = POKEMON_TYPES.map((defender) =>
        getEffectiveness(attacker, [defender])
      )

      expect(actual).toEqual(expected)
    }
  )

  it.each([
    ['fire', ['grass'], 2],
    ['electric', ['ground'], 0],
    ['fire', ['normal'], 1],
    ['water', ['grass'], 0.5],
  ] as const)('%s against %j is ×%s', (attacker, defenders, expected) => {
    expect(getEffectiveness(attacker, defenders)).toBe(expected)
  })

  it.each([
    ['ice', ['grass', 'ground'], 4],
    ['fire', ['fire', 'dragon'], 0.25],
    ['ground', ['fire', 'flying'], 0],
    ['water', ['fire', 'water'], 1],
    ['fire', ['grass', 'steel'], 4],
    ['grass', ['grass', 'steel'], 0.25],
  ] as const)(
    'multiplies %s against the dual type %j into ×%s',
    (attacker, defenders, expected) => {
      expect(getEffectiveness(attacker, defenders)).toBe(expected)
    }
  )

  it.each(POKEMON_TYPES)(
    'only lists known types, once each, for %s',
    (attacker) => {
      const { superEffective, notVeryEffective, noEffect } =
        TYPE_EFFECTIVENESS[attacker]
      const listed: readonly string[] = [
        ...superEffective,
        ...notVeryEffective,
        ...noEffect,
      ]
      const known: readonly string[] = POKEMON_TYPES

      expect(listed.filter((type) => !known.includes(type))).toEqual([])
      expect(new Set(listed).size).toBe(listed.length)
    }
  )

  it('is neutral when there is no defender', () => {
    expect(getEffectiveness('fire', [])).toBe(1)
  })

  it('allows up to two defending types', () => {
    expect(MAX_DEFENDING_TYPES).toBe(2)
  })
})
