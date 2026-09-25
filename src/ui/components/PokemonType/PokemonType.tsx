import { CSSProperties, FC } from 'react'

import { PokemonType as PokemonTypeModel } from '@/core/Pokemon/domain/PokemonType'


import { typeImages } from '@/ui/assets/types'
import classes from './PokemonType.module.css'
import { COLORS } from '@/ui/styles/utils/colors'

interface Props {
  type: PokemonTypeModel
}

export const PokemonType: FC<Props> = ({ type }) => {
  const style = {
    '--type-color': COLORS[type],
  } as CSSProperties

  return (
    <span className={classes.container} style={style}>
      <img src={typeImages[type]} alt={`type ${type}`} className={classes.image} />
      {type}
    </span>
  )
}
