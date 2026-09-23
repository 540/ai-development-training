import height from '@/ui/assets/height.svg'
import weight from '@/ui/assets/weight.svg'

import { CSSProperties, FC } from 'react'

import { Pokemon } from '@/core/Pokemon/domain/Pokemon'
import { COLORS } from '@/ui/styles/utils/colors'

import { PokemonType } from './_components/PokemonType'
import { Link } from '@/ui/components/Link'
import { PokemonStats } from './_components/PokemonStats/PokemonStats'
import classes from './PokemonCard.module.css'

interface Props {
  pokemon: Pokemon
}

export const PokemonCard: FC<Props> = ({ pokemon }) => {
  const [mainType] = pokemon.types
  const style = {
    '--main-type': COLORS[mainType],
  } as CSSProperties

  const normalizedCode = `#${pokemon.id.padStart(3, '0')}`

  return (
    <Link route={{ path: 'details', params: { id: pokemon.id } }}>
      <article className={classes.card} style={style}>
        <header className={classes.header}>
          <p className={classes.headerName}>{pokemon.name}</p>
          <p className={classes.headerCode}>{normalizedCode}</p>
        </header>
        <div className={classes.body}>
          <img
            className={classes.bodyPokemonImg}
            src={pokemon.images.main}
            alt="pokemon"
          />
          <div className={classes.bodyTypes}>
            {pokemon.types.map((type) => (
              <PokemonType key={type} type={type} />
            ))}
          </div>
          <div className={classes.bodyAbout}>About</div>
          <div className={classes.bodyDetails}>
            <div className={classes.bodyDetailsContent}>
              <div className={classes.bodyDetailsContentData}>
                <img
                  className={classes.bodyDetailsContentDataImg}
                  src={weight}
                  alt="weight-icon"
                />
                {pokemon.weight} kg
              </div>
              <div className={classes.bodyDetailsContentTitle}>Weight</div>
            </div>

            <div className={classes.bodyDetailsContent}>
              <div className={classes.bodyDetailsContentData}>
                <img
                  className={classes.bodyDetailsContentDataImg}
                  src={height}
                  alt="height-icon"
                />
                {pokemon.height} m
              </div>
              <div className={classes.bodyDetailsContentTitle}>Height</div>
            </div>
          </div>
          <PokemonStats stats={pokemon.stats} />
        </div>
      </article>
    </Link>
  )
}
