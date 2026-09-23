import { PokemonType } from './PokemonType'

/**
 * Interfaz que define la estructura de un Pokémon
 */
export interface Pokemon {
  /** Identificador único del Pokémon */
  id: string
  /** Nombre del Pokémon */
  name: string
  /** Altura del Pokémon en decímetros */
  height: number
  /** Peso del Pokémon en hectogramos */
  weight: number
  /** Array de tipos del Pokémon (ej: fuego, agua, etc.) */
  types: PokemonType[]
  /** Imágenes del Pokémon */
  images: {
    /** Imagen principal del Pokémon */
    main: string
    /** Imagen alternativa del Pokémon */
    alt: string
  }
  /** Estadísticas base del Pokémon */
  stats: {
    /** Puntos de vida */
    hp: number
    /** Poder de ataque físico */
    attack: number
    /** Capacidad de defensa física */
    defense: number
    /** Poder de ataque especial */
    specialAttack: number
    /** Capacidad de defensa especial */
    specialDefense: number
    /** Velocidad del Pokémon */
    speed: number
  }
}

/** Tipo que representa los nombres de las estadísticas de un Pokémon */
export type StatName = keyof Pokemon['stats']

/** Array constante con todas las generaciones de Pokémon disponibles */
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

/** Tipo que representa una generación específica de Pokémon */
export type PokemonGeneration = (typeof POKEMON_GENERATIONS)[number]
