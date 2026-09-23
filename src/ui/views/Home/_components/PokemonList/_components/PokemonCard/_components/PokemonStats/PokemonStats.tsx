import { Pokemon } from '@/core/Pokemon/domain/Pokemon'
import { FC } from 'react'
import classes from './PokemonStats.module.css'

interface Props {
  stats: Pokemon['stats']
}

export const PokemonStats: FC<Props> = ({ stats }) => {
  return (
    <ul className={classes.container}>
      <Stat title="HP" value={stats.hp} />
      <Stat title="ATK" value={stats.attack} />
      <Stat title="DEF" value={stats.defense} />
      <Stat title="SATK" value={stats.specialAttack} />
      <Stat title="SDEF" value={stats.specialDefense} />
      <Stat title="SPD" value={stats.speed} />
    </ul>
  )
}

interface StatProps {
  title: string
  value: number
}

const Stat: FC<StatProps> = ({ title, value }) => {
  const formattedValue = value.toString().padStart(3, '0')

  return (
    <li className={classes.stat}>
      <p className={classes.statTitle}>{title}</p>
      <p>{formattedValue}</p>
      <progress className={classes.statBar} value={value} max={255} />
    </li>
  )
}
