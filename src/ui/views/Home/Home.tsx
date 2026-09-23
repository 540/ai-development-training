import { FC, useState } from 'react'

import { Pokemon, PokemonGeneration } from '@/core/Pokemon/domain/Pokemon'

import { PokemonList } from './_components/PokemonList'
import { Search, StatFilter } from './_components/Search'
import { Main } from '@/ui/components/Main'
import { usePokemons } from './_hooks/usePokemons'

export const Home: FC = () => {
  const [generation, setGeneration] = useState<PokemonGeneration>('Kanto')
  const [search, setSearch] = useState<string>('')
  const [statFilter, setStatFilter] = useState<StatFilter>({
    stat: 'hp',
    comparison: 'greater',
    value: 0,
  })

  const { pokemons, hasError } = usePokemons(generation)

  if (hasError) {
    return (
      <Main>
        <h1>Error loading Pokémons</h1>
      </Main>
    )
  }

  const filteredPokemons = filterPokemons(pokemons, search, statFilter)

  return (
    <Main>
      <Search
        generation={generation}
        search={search}
        statFilter={statFilter}
        onGenerationChange={setGeneration}
        onSearchChange={setSearch}
        onStatFilterChange={setStatFilter}
      />
      <PokemonList pokemons={filteredPokemons} />
    </Main>
  )
}

const COMPARISONS: Record<StatFilter['comparison'], (stat: number, value: number) => boolean> = {
  greater: (stat, value) => stat > value,
  equal: (stat, value) => stat === value,
  less: (stat, value) => stat < value,
}

const matchesText = (pokemon: Pokemon, search: string): boolean => {
  const text = search.toLowerCase()

  return pokemon.name.toLowerCase().includes(text) || pokemon.types.some((type) => type.toLowerCase().includes(text))
}

const matchesStat = (pokemon: Pokemon, statFilter: StatFilter, isSearching: boolean): boolean => {
  const comparison = statFilter.comparison === 'less' && isSearching ? 'greater' : statFilter.comparison

  return COMPARISONS[comparison](pokemon.stats[statFilter.stat], statFilter.value)
}

const filterPokemons = (
  pokemons: Pokemon[] | undefined,
  search: string,
  statFilter: StatFilter
): Pokemon[] | undefined => {
  const isSearching = search.trim().length > 0

  return pokemons?.filter(
    (pokemon) => (!isSearching || matchesText(pokemon, search)) && matchesStat(pokemon, statFilter, isSearching)
  )
}
