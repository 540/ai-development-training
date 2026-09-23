import { Pokemon } from '@/core/Pokemon/domain/Pokemon'
import { PokemonType } from '@/core/Pokemon/domain/PokemonType'

import { PokemonDTO } from '../dto/Pokemon.dto'

export const buildPokemon = (pokemonDTO: PokemonDTO): Pokemon => ({
  id: pokemonDTO.id.toString(),
  name: pokemonDTO.name,
  height: pokemonDTO.height / 10,
  weight: pokemonDTO.weight / 10,
  types: pokemonDTO.types.map(({ type }) => type.name as PokemonType),
  images: {
    main: pokemonDTO.sprites.other['official-artwork'].front_default,
    alt: pokemonDTO.sprites.other.dream_world.front_default,
  },
  stats: mapStatsDTOToStats(pokemonDTO.stats),
})

const STAT_NAMES: Record<
  PokemonDTO['stats'][0]['stat']['name'],
  keyof Pokemon['stats']
> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
}

const mapStatsDTOToStats = (stats: PokemonDTO['stats']): Pokemon['stats'] =>
  stats.reduce(
    (acc, { base_stat, stat }) => ({ ...acc, [STAT_NAMES[stat.name]]: base_stat }),
    {} as Pokemon['stats']
  )
