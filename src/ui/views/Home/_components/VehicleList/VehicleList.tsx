import { FC } from 'react'

import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { VehicleCardSkeleton } from '@/ui/components/VehicleCardSkeleton'
import { TEXTS } from '@/ui/texts/texts'

import { VehicleCard } from '../VehicleCard'
import classes from './VehicleList.module.css'

const SKELETONS = 9

export const VehicleList: FC<{ vehicles: Vehicle[] | undefined }> = ({ vehicles }) => {
  if (!vehicles) {
    return (
      <div className={classes.list}>
        {Array.from({ length: SKELETONS }, (_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (vehicles.length === 0) {
    return <h2>{TEXTS.home.empty}</h2>
  }

  return (
    <div className={classes.list}>
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
