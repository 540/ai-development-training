import { CSSProperties, FC } from 'react'

import { PokemonType as PokemonTypeModel } from '@/core/Pokemon/domain/PokemonType'

import bug from '@/ui/assets/types/bug.svg'
import dark from '@/ui/assets/types/dark.svg'
import dragon from '@/ui/assets/types/dragon.svg'
import electric from '@/ui/assets/types/electric.svg'
import fairy from '@/ui/assets/types/fairy.svg'
import fighting from '@/ui/assets/types/fighting.svg'
import fire from '@/ui/assets/types/fire.svg'
import flying from '@/ui/assets/types/flying.svg'
import ghost from '@/ui/assets/types/ghost.svg'
import grass from '@/ui/assets/types/grass.svg'
import ground from '@/ui/assets/types/ground.svg'
import ice from '@/ui/assets/types/ice.svg'
import normal from '@/ui/assets/types/normal.svg'
import poison from '@/ui/assets/types/poison.svg'
import psychic from '@/ui/assets/types/psychic.svg'
import rock from '@/ui/assets/types/rock.svg'
import steel from '@/ui/assets/types/steel.svg'
import water from '@/ui/assets/types/water.svg'

import classes from './PokemonType.module.css'
import { COLORS } from '@/ui/styles/utils/colors'

const images: Record<PokemonTypeModel, string> = {
  bug,
  dark,
  dragon,
  electric,
  fairy,
  fighting,
  fire,
  flying,
  ghost,
  grass,
  ground,
  ice,
  normal,
  poison,
  psychic,
  rock,
  steel,
  water,
}

interface Props {
  type: PokemonTypeModel
}

export const PokemonType: FC<Props> = ({ type }) => {
  const style = {
    '--type-color': COLORS[type],
  } as CSSProperties

  return (
    <span className={classes.container} style={style}>
      <img src={images[type]} alt={`type ${type}`} className={classes.image} />
      {type}
    </span>
  )
}
