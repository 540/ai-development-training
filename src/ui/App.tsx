import { useEffect, useState } from 'react'
import { viewPokemon, type PokemonView } from '../application/view-pokemon'
import { pokeApiPokemonRepository } from '../infrastructure/poke-api'

const SEED_POKEDEX_ID = 1

export function App() {
  const [pokemon, setPokemon] = useState<PokemonView | null>(null)

  useEffect(() => {
    let abandoned = false

    void viewPokemon(pokeApiPokemonRepository(), SEED_POKEDEX_ID).then((view) => {
      if (!abandoned) {
        setPokemon(view)
      }
    })

    return () => {
      abandoned = true
    }
  }, [])

  if (pokemon === null) {
    return <p data-testid="loading">Cargando…</p>
  }

  return (
    <main>
      <h1 data-testid="pokemon-name">{pokemon.name}</h1>
      <p data-testid="pokemon-number">{pokemon.pokedexNumber}</p>
      <img src={pokemon.frontImageUrl} alt={pokemon.name} />
    </main>
  )
}
