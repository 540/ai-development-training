import { PokemonType } from './PokemonType'

/**
 * Shape of a Pokémon
 */
export interface Pokemon {
  /** Unique identifier of the Pokémon */
  id: string
  /** Name of the Pokémon */
  name: string
  /** Height of the Pokémon in meters */
  height: number
  /** Weight of the Pokémon in kilograms */
  weight: number
  /** Types of the Pokémon (e.g. fire, water) */
  types: PokemonType[]
  /** Images of the Pokémon */
  images: {
    /** Main image of the Pokémon */
    main: string
    /** Alternative image of the Pokémon */
    alt: string
  }
  /** Base stats of the Pokémon */
  stats: {
    /** Hit points */
    hp: number
    /** Physical attack */
    attack: number
    /** Physical defense */
    defense: number
    /** Special attack */
    specialAttack: number
    /** Special defense */
    specialDefense: number
    /** Speed of the Pokémon */
    speed: number
  }
}

/** Names of the stats of a Pokémon */
export type StatName = keyof Pokemon['stats']

/** Every available Pokémon generation */
export const POKEMON_GENERATIONS = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea',
] as const

/** A single Pokémon generation */
export type PokemonGeneration = (typeof POKEMON_GENERATIONS)[number]
