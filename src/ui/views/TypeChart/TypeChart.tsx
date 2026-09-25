import { FC, useState } from 'react'

import { PokemonType } from '@/core/Pokemon/domain/PokemonType'
import { MAX_DEFENDING_TYPES } from '@/core/Pokemon/domain/TypeEffectiveness'
import { Main } from '@/ui/components/Main'

import { EffectivenessTable } from './_components/EffectivenessTable'
import { SelectionSummary } from './_components/SelectionSummary'
import classes from './TypeChart.module.css'

export const TypeChart: FC = () => {
  const [selected, setSelected] = useState<PokemonType[]>([])

  const toggle = (type: PokemonType) => {
    setSelected((current) => {
      if (current.includes(type)) return current.filter((item) => item !== type)
      if (current.length < MAX_DEFENDING_TYPES) return [...current, type]

      return current
    })
  }

  return (
    <Main>
      <h1 className={classes.title}>Type Chart</h1>
      <EffectivenessTable selected={selected} onToggle={toggle} />
      <SelectionSummary selected={selected} />
    </Main>
  )
}
