import { FC } from 'react'
import { Link } from 'react-router-dom'

import { headlineConsumption } from '@/core/Vehicle/domain/headlineConsumption'
import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { CompareButton } from '@/ui/components/CompareButton'
import { FuelChip } from '@/ui/components/FuelChip'
import { detailsPath } from '@/ui/router/paths'
import { FUEL_COLORS } from '@/ui/styles/utils/colors'
import { trimLabel, vehicleClassLabel } from '@/ui/texts/labels'
import { TEXTS } from '@/ui/texts/texts'
import { formatConsumption, formatUsd } from '@/ui/utils/format'

import classes from './VehicleCard.module.css'

export const VehicleCard: FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const headline = headlineConsumption(vehicle)
  const color = FUEL_COLORS[vehicle.fuel]
  const stats = [
    [formatConsumption(headline?.consumption.city), TEXTS.card.city],
    [formatConsumption(headline?.consumption.highway), TEXTS.card.highway],
    [String(vehicle.co2), TEXTS.card.co2],
    [formatUsd(vehicle.annualFuelCostUsd), TEXTS.card.fuelPerYear],
  ]

  return (
    <article className={classes.card} style={{ borderTopColor: color }}>
      <Link to={detailsPath(vehicle.id)}>
        <div className={classes.top}>
          <h2 className={classes.name}>
            {vehicle.make} {vehicle.model}
          </h2>
          <p className={classes.year}>{vehicle.year}</p>
        </div>
        {vehicle.trim && <p className={classes.trim}>{trimLabel(vehicle.trim)}</p>}
        <div className={classes.chips}>
          <FuelChip fuel={vehicle.fuel} />
          <span className={classes.classChip}>{vehicleClassLabel(vehicle.vehicleClass)}</span>
        </div>
        <div className={classes.consumption} style={{ color }}>
          {formatConsumption(headline?.consumption.combined)}
          {headline && <span>{TEXTS.units[headline.unit]}</span>}
        </div>
        <div className={classes.stats}>
          {stats.map(([value, title]) => (
            <div key={title} className={classes.stat}>
              <div className={classes.statValue}>{value}</div>
              <div className={classes.statTitle}>{title}</div>
            </div>
          ))}
        </div>
      </Link>
      <CompareButton vehicleId={vehicle.id} />
    </article>
  )
}
