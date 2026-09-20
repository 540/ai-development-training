import { useEffect, useState } from 'react'
import { viewPokemon, type PokemonView } from '../application/view-pokemon'
import type { PokemonRepository } from '../domain/pokemon-repository'

const SEED_POKEDEX_ID = 1

type AppProps = {
  pokemonRepository: PokemonRepository
}

type Screen =
  | { status: 'loading' }
  | { status: 'loaded'; pokemon: PokemonView }
  | { status: 'failed' }

export function App({ pokemonRepository }: AppProps) {
  const [screen, setScreen] = useState<Screen>({ status: 'loading' })

  useEffect(() => {
    let abandoned = false

    void viewPokemon(pokemonRepository, SEED_POKEDEX_ID).then(
      (pokemon) => {
        if (!abandoned) {
          setScreen({ status: 'loaded', pokemon })
        }
      },
      () => {
        if (!abandoned) {
          setScreen({ status: 'failed' })
        }
      },
    )

    return () => {
      abandoned = true
    }
  }, [pokemonRepository])

  if (screen.status === 'loading') {
    return <p data-testid="loading">Cargando…</p>
  }

  if (screen.status === 'failed') {
    return <p data-testid="error">No hemos podido traer la Pokédex. Inténtalo de nuevo más tarde.</p>
  }

  return (
    <main>
      <h1 data-testid="pokemon-name">{screen.pokemon.name}</h1>
      <p data-testid="pokemon-number">{screen.pokemon.pokedexNumber}</p>
      <img src={screen.pokemon.frontImageUrl} alt={screen.pokemon.name} />
    </main>
  )
}
