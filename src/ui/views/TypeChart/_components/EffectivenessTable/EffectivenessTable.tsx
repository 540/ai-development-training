import { FC } from 'react'

import { POKEMON_TYPES, PokemonType as PokemonTypeModel } from '@/core/Pokemon/domain/PokemonType'
import { MAX_DEFENDING_TYPES, getEffectiveness } from '@/core/Pokemon/domain/TypeEffectiveness'
import { PokemonType } from '@/ui/components/PokemonType'

import { effectivenessClass, formatMultiplier } from '../../_utils/effectiveness'
import classes from './EffectivenessTable.module.css'

interface Props {
  selected: readonly PokemonTypeModel[]
  onToggle: (type: PokemonTypeModel) => void
}

export const EffectivenessTable: FC<Props> = ({ selected, onToggle }) => {
  const isFull = selected.length >= MAX_DEFENDING_TYPES
  const columnClass = (defender: PokemonTypeModel) => (selected.includes(defender) ? classes.selected : '')

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
                <th key={defender} scope="col" className={columnClass(defender)}>
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

                return (
                  <td
                    key={defender}
                    aria-label={`${attacker} vs ${defender}: ${formatMultiplier(value)}`}
                    className={`${classes.cell} ${effectivenessClass(value)} ${columnClass(defender)}`}
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
