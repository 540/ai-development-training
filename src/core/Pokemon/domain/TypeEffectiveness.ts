import { PokemonType } from './PokemonType'

interface AttackEffectiveness {
  superEffective: readonly PokemonType[]
  notVeryEffective: readonly PokemonType[]
  noEffect: readonly PokemonType[]
}

export const MAX_DEFENDING_TYPES = 2

export const TYPE_EFFECTIVENESS: Record<PokemonType, AttackEffectiveness> = {
  normal: {
    superEffective: [],
    notVeryEffective: ['rock', 'steel'],
    noEffect: ['ghost'],
  },
  fire: {
    superEffective: ['water', 'grass', 'ice', 'bug', 'steel'],
    notVeryEffective: ['fire', 'rock', 'dragon'],
    noEffect: [],
  },
  water: {
    superEffective: ['fire', 'ground', 'rock'],
    notVeryEffective: ['water', 'grass', 'dragon'],
    noEffect: [],
  },
  electric: {
    superEffective: ['water', 'flying'],
    notVeryEffective: ['electric', 'grass', 'dragon'],
    noEffect: ['ground'],
  },
  grass: {
    superEffective: ['water', 'ground', 'rock'],
    notVeryEffective: [
      'fire',
      'grass',
      'poison',
      'flying',
      'bug',
      'dragon',
      'steel',
    ],
    noEffect: [],
  },
  ice: {
    superEffective: ['grass', 'ground', 'flying', 'dragon'],
    notVeryEffective: ['fire', 'water', 'ice', 'steel'],
    noEffect: [],
  },
  fighting: {
    superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'],
    notVeryEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
    noEffect: ['ghost'],
  },
  poison: {
    superEffective: ['grass', 'fairy'],
    notVeryEffective: ['poison', 'ground', 'rock', 'ghost'],
    noEffect: ['steel'],
  },
  ground: {
    superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'],
    notVeryEffective: ['grass', 'bug'],
    noEffect: ['flying'],
  },
  flying: {
    superEffective: ['grass', 'fighting', 'bug'],
    notVeryEffective: ['electric', 'rock', 'steel'],
    noEffect: [],
  },
  psychic: {
    superEffective: ['fighting', 'poison'],
    notVeryEffective: ['psychic', 'steel'],
    noEffect: ['dark'],
  },
  bug: {
    superEffective: ['grass', 'psychic', 'dark'],
    notVeryEffective: [
      'fire',
      'fighting',
      'poison',
      'flying',
      'ghost',
      'steel',
      'fairy',
    ],
    noEffect: [],
  },
  rock: {
    superEffective: ['fire', 'ice', 'flying', 'bug'],
    notVeryEffective: ['fighting', 'ground', 'steel'],
    noEffect: [],
  },
  ghost: {
    superEffective: ['psychic', 'ghost'],
    notVeryEffective: ['dark'],
    noEffect: ['normal'],
  },
  dragon: {
    superEffective: ['dragon'],
    notVeryEffective: ['steel'],
    noEffect: ['fairy'],
  },
  dark: {
    superEffective: ['psychic', 'ghost'],
    notVeryEffective: ['fighting', 'dark', 'fairy'],
    noEffect: [],
  },
  steel: {
    superEffective: ['ice', 'rock', 'fairy'],
    notVeryEffective: ['fire', 'water', 'electric', 'steel'],
    noEffect: [],
  },
  fairy: {
    superEffective: ['fighting', 'dragon', 'dark'],
    notVeryEffective: ['fire', 'poison', 'steel'],
    noEffect: [],
  },
}

const singleEffectiveness = (
  attacker: PokemonType,
  defender: PokemonType
): number => {
  const { superEffective, notVeryEffective, noEffect } =
    TYPE_EFFECTIVENESS[attacker]

  if (noEffect.includes(defender)) return 0
  if (superEffective.includes(defender)) return 2
  if (notVeryEffective.includes(defender)) return 0.5
  return 1
}

export const getEffectiveness = (
  attacker: PokemonType,
  defenders: readonly PokemonType[]
): number =>
  defenders.reduce(
    (total, defender) => total * singleEffectiveness(attacker, defender),
    1
  )
