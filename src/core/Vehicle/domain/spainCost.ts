import { Consumption, FuelKind, Vehicle } from './Vehicle'

/**
 * Business assumptions for the yearly energy cost in Spain. The source gives
 * no Spanish prices nor yearly distance, so they live here and only here.
 */
export const SPAIN_COST_ASSUMPTIONS = {
  kilometersPerYear: 15000,
  gasolineEurPerLiter: 1.6,
  dieselEurPerLiter: 1.5,
  electricityEurPerKwh: 0.2,
} as const

const HUNDREDS_OF_KM_PER_YEAR = SPAIN_COST_ASSUMPTIONS.kilometersPerYear / 100

const fuelCost = (liters: Consumption, eurPerLiter: number): number =>
  liters.combined * HUNDREDS_OF_KM_PER_YEAR * eurPerLiter

const electricityCost = (electricity: Consumption): number =>
  electricity.combined * HUNDREDS_OF_KM_PER_YEAR * SPAIN_COST_ASSUMPTIONS.electricityEurPerKwh

const gasolineCost = ({ liters }: Vehicle): number | null =>
  liters ? fuelCost(liters, SPAIN_COST_ASSUMPTIONS.gasolineEurPerLiter) : null

const noCost = (): null => null

const COST_BY_FUEL: Record<FuelKind, (vehicle: Vehicle) => number | null> = {
  gasoline: gasolineCost,
  hybrid: gasolineCost,
  flexFuel: gasolineCost,
  diesel: ({ liters }) => (liters ? fuelCost(liters, SPAIN_COST_ASSUMPTIONS.dieselEurPerLiter) : null),
  electric: ({ electricity }) => (electricity ? electricityCost(electricity) : null),
  plugInHybrid: ({ liters, electricity, utilityFactor }) =>
    liters && electricity
      ? utilityFactor * electricityCost(electricity) +
        (1 - utilityFactor) * fuelCost(liters, SPAIN_COST_ASSUMPTIONS.gasolineEurPerLiter)
      : null,
  naturalGas: noCost,
  bifuelNaturalGas: noCost,
  bifuelLpg: noCost,
  hydrogen: noCost,
}

/**
 * Yearly energy cost in Spain, in whole euros, with SPAIN_COST_ASSUMPTIONS.
 * Null when the fuel has no Spanish price or the consumption it needs is unknown.
 */
export const annualEnergyCostInSpain = (vehicle: Vehicle): number | null => {
  const cost = COST_BY_FUEL[vehicle.fuel](vehicle)
  return cost === null ? null : Math.round(cost)
}

export interface CheapestInSpain {
  vehicle: Vehicle
  annualCost: number
}

/**
 * The vehicle with the lowest yearly energy cost in Spain; the first one wins a tie.
 * Null when fewer than two vehicles have a cost to compare.
 */
export const cheapestInSpain = (vehicles: Vehicle[]): CheapestInSpain | null => {
  const costs = vehicles
    .map((vehicle) => ({ vehicle, annualCost: annualEnergyCostInSpain(vehicle) }))
    .filter((entry): entry is CheapestInSpain => entry.annualCost !== null)
  if (costs.length < 2) {
    return null
  }
  return costs.reduce((cheapest, entry) => (entry.annualCost < cheapest.annualCost ? entry : cheapest))
}
