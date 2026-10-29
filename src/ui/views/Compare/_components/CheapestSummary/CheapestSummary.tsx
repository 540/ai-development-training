import { FC } from 'react'

import {
  cheapestByEnergyCost,
  ENERGY_PRICES_MONTH,
  KILOMETERS_PER_YEAR,
  SPAIN_ENERGY_PRICES,
} from '@/core/Vehicle/domain/energyCost'
import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { TEXTS } from '@/ui/texts/texts'
import { formatMonthYear, formatNumber } from '@/ui/utils/format'

import classes from './CheapestSummary.module.css'

const vehicleName = (vehicle: Vehicle): string => `${vehicle.year} ${vehicle.make} ${vehicle.model}`

const ASSUMPTIONS = TEXTS.compare.energyAssumptions(
  formatNumber(SPAIN_ENERGY_PRICES.gasolineEurPerLiter),
  formatNumber(SPAIN_ENERGY_PRICES.dieselEurPerLiter),
  formatNumber(SPAIN_ENERGY_PRICES.electricityEurPerKwh),
  formatMonthYear(ENERGY_PRICES_MONTH),
  formatNumber(KILOMETERS_PER_YEAR),
)

/** Which compared vehicle costs the least energy in Spain, and the assumptions behind it */
export const CheapestSummary: FC<{ vehicles: Vehicle[] }> = ({ vehicles }) => {
  const result = cheapestByEnergyCost(vehicles)
  if (!result) {
    return null
  }

  const summary =
    result.cheapest.length > 1
      ? TEXTS.compare.cheapestTie(result.cheapest.map(vehicleName))
      : TEXTS.compare.cheapest(
          vehicleName(result.cheapest[0]),
          formatNumber(result.savingEur),
          vehicleName(result.priciest),
        )

  return (
    <section className={classes.cheapest}>
      <p className={classes.summary} role="status">
        {summary}
      </p>
      <p className={classes.assumptions}>{ASSUMPTIONS}</p>
    </section>
  )
}
