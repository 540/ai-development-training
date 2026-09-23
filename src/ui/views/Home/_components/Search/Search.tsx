import { FC } from 'react'

import {
  POKEMON_GENERATIONS,
  PokemonGeneration,
  StatName,
} from '@/core/Pokemon/domain/Pokemon'

import styles from './Search.module.css'

export type StatComparison = 'greater' | 'equal' | 'less'

export interface StatFilter {
  stat: StatName
  comparison: StatComparison
  value: number
}

interface Props {
  generation: string
  onGenerationChange: (generation: PokemonGeneration) => void
  search: string
  onSearchChange: (search: string) => void
  statFilter: StatFilter
  onStatFilterChange: (statFilter: StatFilter) => void
}

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  specialAttack: 'S.ATK',
  specialDefense: 'S.DEF',
  speed: 'SPD',
}

const COMPARISON_LABELS: Record<StatComparison, string> = {
  greater: 'Greater than',
  equal: 'Equal to',
  less: 'Less than',
}

export const Search: FC<Props> = ({
  generation,
  onGenerationChange,
  search,
  onSearchChange,
  statFilter,
  onStatFilterChange,
}) => {
  return (
    <section className={styles.container}>
      <select
        className={styles.select}
        value={generation}
        onChange={({ target }) => {
          onGenerationChange(target.value as PokemonGeneration)
        }}
      >
        {POKEMON_GENERATIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        className={styles.input}
        value={search}
        placeholder="Filter by name or type"
        onChange={({ target }) => {
          onSearchChange(target.value)
        }}
      />
      <div className={styles.statFilter}>
        <select
          className={styles.statSelect}
          value={statFilter.stat}
          onChange={({ target }) => {
            onStatFilterChange({
              ...statFilter,
              stat: target.value as StatName,
            })
          }}
        >
          {Object.entries(STAT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className={styles.comparisonSelect}
          value={statFilter.comparison}
          onChange={({ target }) => {
            onStatFilterChange({
              ...statFilter,
              comparison: target.value as StatComparison,
            })
          }}
        >
          {Object.entries(COMPARISON_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          className={styles.valueInput}
          type="text"
          value={statFilter.value}
          placeholder="Value"
          onChange={({ target }) => {
            const numValue = Number(target.value)
            onStatFilterChange({
              ...statFilter,
              value: isNaN(numValue) ? 0 : numValue,
            })
          }}
        />
      </div>
    </section>
  )
}
