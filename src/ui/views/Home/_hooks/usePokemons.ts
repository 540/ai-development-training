import { useState, useEffect } from 'react'

import { Pokemon, PokemonGeneration } from '@/core/Pokemon/domain/Pokemon'
import { pokemonService } from '@/core/Pokemon/services/Pokemon.service'

export const usePokemons = (generation: PokemonGeneration) => {
  const [pokemons, setPokemons] = useState<Pokemon[] | undefined>(undefined)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
    setPokemons(undefined)

    pokemonService
      .listByGeneration(generation)
      .then(setPokemons)
      .catch(() => setHasError(true))
  }, [generation])

  return {
    pokemons,
    hasError,
  }
}
