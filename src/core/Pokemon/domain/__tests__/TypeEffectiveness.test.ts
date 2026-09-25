import { POKEMON_TYPES, PokemonType } from '../PokemonType'
import { MAX_DEFENDING_TYPES, getEffectiveness } from '../TypeEffectiveness'

// Expected chart from CONTEXT.md: [super effective, not very effective, no effect]
const CHART: Record<PokemonType, [string, string, string]> = {
  normal: ['', 'rock steel', 'ghost'],
  fire: ['water grass ice bug steel', 'fire rock dragon', ''],
  water: ['fire ground rock', 'water grass dragon', ''],
  electric: ['water flying', 'electric grass dragon', 'ground'],
  grass: ['water ground rock', 'fire grass poison flying bug dragon steel', ''],
  ice: ['grass ground flying dragon', 'fire water ice steel', ''],
  fighting: ['normal ice rock dark steel', 'poison flying psychic bug fairy', 'ghost'],
  poison: ['grass fairy', 'poison ground rock ghost', 'steel'],
  ground: ['fire electric poison rock steel', 'grass bug', 'flying'],
  flying: ['grass fighting bug', 'electric rock steel', ''],
  psychic: ['fighting poison', 'psychic steel', 'dark'],
  bug: ['grass psychic dark', 'fire fighting poison flying ghost steel fairy', ''],
  rock: ['fire ice flying bug', 'fighting ground steel', ''],
  ghost: ['psychic ghost', 'dark', 'normal'],
  dragon: ['dragon', 'steel', 'fairy'],
  dark: ['psychic ghost', 'fighting dark fairy', ''],
  steel: ['ice rock fairy', 'fire water electric steel', ''],
  fairy: ['fighting dragon dark', 'fire poison steel', ''],
}

const expectedMultiplier = (attacker: PokemonType, defender: PokemonType): number => {
  const [superEffective, notVeryEffective, noEffect] = CHART[attacker].map((list) => list.split(' '))

  if (superEffective.includes(defender)) return 2
  if (notVeryEffective.includes(defender)) return 0.5
  if (noEffect.includes(defender)) return 0

  return 1
}

describe('type effectiveness', () => {
  it.each(POKEMON_TYPES)('knows the full chart for %s attacks', (attacker) => {
    const actual = POKEMON_TYPES.map((defender) => getEffectiveness(attacker, [defender]))
    const expected = POKEMON_TYPES.map((defender) => expectedMultiplier(attacker, defender))

    expect(actual).toEqual(expected)
  })

  it.each([
    ['fire', ['grass'], 2],
    ['water', ['grass'], 0.5],
    ['electric', ['ground'], 0],
    ['fire', ['normal'], 1],
    ['ice', ['grass', 'ground'], 4],
    ['fire', ['fire', 'dragon'], 0.25],
    ['ground', ['fire', 'flying'], 0],
    ['water', ['fire', 'water'], 1],
    ['grass', ['water', 'ground'], 4],
    ['grass', ['grass', 'steel'], 0.25],
  ] as const)('%s against %j is ×%s', (attacker, defenders, expected) => {
    expect(getEffectiveness(attacker, defenders)).toBe(expected)
  })

  it('is neutral when there is no defending type', () => {
    expect(getEffectiveness('fire', [])).toBe(1)
  })

  it('allows up to two defending types', () => {
    expect(MAX_DEFENDING_TYPES).toBe(2)
  })
})
