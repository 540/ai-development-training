import { FC } from 'react'

import { POKEMON_TYPES, PokemonType as PokemonTypeModel } from '@/core/Pokemon/domain/PokemonType'
import { getEffectiveness } from '@/core/Pokemon/domain/TypeEffectiveness'
import { PokemonType } from '@/ui/components/PokemonType'

import { effectivenessClass, formatMultiplier } from '../../_utils/effectiveness'
import classes from './SelectionSummary.module.css'

interface Props {
  selected: readonly PokemonTypeModel[]
}

export const SelectionSummary: FC<Props> = ({ selected }) => {
  if (selected.length === 0) {
    return <p className={classes.hint}>Select up to two defending types to see the combined effectiveness</p>
  }

  return (
    <section aria-label="Combined effectiveness" className={classes.container}>
      <h2 className={classes.title}>Against {selected.join(' / ')}</h2>
      <ul className={classes.list}>
        {POKEMON_TYPES.map((attacker) => {
          const value = getEffectiveness(attacker, selected)

          return (
            <li key={attacker} aria-label={attacker} className={classes.item}>
              <PokemonType type={attacker} />
              <span className={`${classes.multiplier} ${effectivenessClass(value)}`}>
                {formatMultiplier(value)}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
