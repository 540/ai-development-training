import type { ReactElement } from 'react'
import { pokeApiPokemonRepository } from './infrastructure/poke-api'
import { App } from './ui/App'

export function createApp(): ReactElement {
  return <App pokemonRepository={pokeApiPokemonRepository()} />
}
