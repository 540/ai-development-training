import { FC } from 'react'
import classes from './VehicleCardSkeleton.module.css'

const STATS = 4

/** Placeholder with the same size as a vehicle card, shown while the API answers */
export const VehicleCardSkeleton: FC<{ centered?: boolean }> = ({ centered = false }) => (
  <div className={centered ? `${classes.card} ${classes.centered}` : classes.card} data-testid="vehicleCardSkeleton">
    <div>
      <div className={classes.top}>
        <div className={`${classes.bone} ${classes.name}`} />
        <div className={`${classes.bone} ${classes.year}`} />
      </div>
      <div className={`${classes.bone} ${classes.trim}`} />
      <div className={classes.chips}>
        <div className={`${classes.bone} ${classes.chip}`} />
        <div className={`${classes.bone} ${classes.chip} ${classes.chipWide}`} />
      </div>
      <div className={`${classes.bone} ${classes.consumption}`} />
      <div className={classes.stats}>
        {Array.from({ length: STATS }, (_, index) => (
          <div key={index} className={classes.stat}>
            <div className={`${classes.bone} ${classes.statValue}`} />
            <div className={`${classes.bone} ${classes.statTitle}`} />
          </div>
        ))}
      </div>
    </div>
    <div className={`${classes.bone} ${classes.button}`} />
  </div>
)
