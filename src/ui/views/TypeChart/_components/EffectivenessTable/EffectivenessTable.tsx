import { FC } from 'react'

import {
  POKEMON_TYPES,
  PokemonType as PokemonTypeModel,
} from '@/core/Pokemon/domain/PokemonType'
import {
  MAX_DEFENDING_TYPES,
  getEffectiveness,
} from '@/core/Pokemon/domain/TypeEffectiveness'

import { PokemonType } from '@/ui/components/PokemonType'
import effectiveness from '../../_utils/effectiveness.module.css'
import { effectivenessClass, formatMultiplier } from '../../_utils/formatMultiplier'
import classes from './EffectivenessTable.module.css'

interface Props {
  selected: readonly PokemonTypeModel[]
  onToggle: (type: PokemonTypeModel) => void
}

export const EffectivenessTable: FC<Props> = ({ selected, onToggle }) => {
  const isFull = selected.length >= MAX_DEFENDING_TYPES

  return (
    <div className={classes.container}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th scope="col" className={classes.corner}>
              Attack \ Defense
            </th>
            {POKEMON_TYPES.map((defender) => {
              const isSelected = selected.includes(defender)
              return (
                <th
                  key={defender}
                  scope="col"
                  className={isSelected ? classes.selected : undefined}
                >
                  <button
                    type="button"
                    className={classes.defenderButton}
                    aria-label={defender}
                    aria-pressed={isSelected}
                    disabled={isFull && !isSelected}
                    onClick={() => onToggle(defender)}
                  >
                    <PokemonType type={defender} />
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {POKEMON_TYPES.map((attacker) => (
            <tr key={attacker}>
              <th scope="row" className={classes.attacker}>
                <PokemonType type={attacker} />
              </th>
              {POKEMON_TYPES.map((defender) => {
                const value = getEffectiveness(attacker, [defender])
                const isSelected = selected.includes(defender)
                const cellClasses = [
                  classes.cell,
                  effectiveness[effectivenessClass(value)],
                  isSelected ? classes.selected : '',
                  isSelected && value === 1 ? classes.selectedNeutral : '',
                ].join(' ')
                return (
                  <td
                    key={defender}
                    className={cellClasses}
                    aria-label={`${attacker} vs ${defender}: ${formatMultiplier(value)}`}
                  >
                    {value === 1 ? '' : formatMultiplier(value)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
