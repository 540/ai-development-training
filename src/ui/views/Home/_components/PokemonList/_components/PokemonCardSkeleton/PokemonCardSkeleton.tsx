import { FC } from 'react'
import classes from './PokemonCardSkeleton.module.css'

export const PokemonCardSkeleton: FC = () => (
  <div className={classes.cardSkeleton}>
    <div className={classes.cardSkeletonHeader}>
      <div className={classes.cardSkeletonHeaderName} />
      <div className={classes.cardSkeletonHeaderCode} />
    </div>
    <div className={classes.cardSkeletonBody}>
      <div className={classes.cardSkeletonBodyPokemonImg} />
      <div className={classes.cardSkeletonBodyTypes}>
        {Array.from(Array(2).keys()).map((index) => (
          <span key={index} className={classes.cardSkeletonBodyTypeBadge} />
        ))}
      </div>
      <div className={classes.cardSkeletonBodyDetails} />
      <div className={classes.cardSkeletonBodyStats} />
    </div>
  </div>
)
