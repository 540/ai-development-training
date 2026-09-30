import { FuelKind, Vehicle } from './Vehicle'

/** Kilometers a car is assumed to drive in a year (business assumption, not given by the API) */
export const ANNUAL_KILOMETERS = 15_000

/** Energy prices in Spain (business assumptions, not given by the API) */
export const SPAIN_ENERGY_PRICES = {
  gasolineEurPerLiter: 1.6,
  dieselEurPerLiter: 1.5,
  electricityEurPerKwh: 0.2,
}

type EnergySource = 'gasoline' | 'diesel' | 'electricity' | 'plugIn'

/** Which energy each fuel is paid with in Spain; null when there is no price for it */
const ENERGY_SOURCE_BY_FUEL: Record<FuelKind, EnergySource | null> = {
  gasoline: 'gasoline',
  hybrid: 'gasoline',
  flexFuel: 'gasoline',
  diesel: 'diesel',
  electric: 'electricity',
  plugInHybrid: 'plugIn',
  naturalGas: null,
  bifuelNaturalGas: null,
  bifuelLpg: null,
  hydrogen: null,
}

const priced = (amount: number | undefined, price: number): number | null =>
  amount === undefined ? null : amount * price

/** Energy cost every 100 km, in euros, for each energy source */
const COST_PER_100_KM: Record<EnergySource, (vehicle: Vehicle) => number | null> = {
  gasoline: (vehicle) => priced(vehicle.liters?.combined, SPAIN_ENERGY_PRICES.gasolineEurPerLiter),
  diesel: (vehicle) => priced(vehicle.liters?.combined, SPAIN_ENERGY_PRICES.dieselEurPerLiter),
  electricity: (vehicle) => priced(vehicle.electricity?.combined, SPAIN_ENERGY_PRICES.electricityEurPerKwh),
  plugIn: (vehicle) => {
    const electricPart = COST_PER_100_KM.electricity(vehicle)
    const gasolinePart = COST_PER_100_KM.gasoline(vehicle)
    return electricPart === null || gasolinePart === null
      ? null
      : vehicle.utilityFactor * electricPart + (1 - vehicle.utilityFactor) * gasolinePart
  },
}

/** Yearly energy cost in Spain, in euros rounded to the unit; null when it cannot be estimated */
export const annualEnergyCostEur = (vehicle: Vehicle): number | null => {
  const source = ENERGY_SOURCE_BY_FUEL[vehicle.fuel]
  const cost = source === null ? null : COST_PER_100_KM[source](vehicle)
  return cost === null ? null : Math.round((cost * ANNUAL_KILOMETERS) / 100)
}

/** The vehicles with the lowest yearly energy cost in Spain, and that cost */
export interface CheapestInSpain {
  vehicles: Vehicle[]
  annualCostEur: number
}

/** The cheapest vehicles to run in Spain; null when fewer than two have a known cost */
export const cheapestInSpain = (vehicles: Vehicle[]): CheapestInSpain | null => {
  const costs = vehicles
    .map((vehicle) => ({ vehicle, cost: annualEnergyCostEur(vehicle) }))
    .filter((entry): entry is { vehicle: Vehicle; cost: number } => entry.cost !== null)
  if (costs.length < 2) {
    return null
  }
  const annualCostEur = Math.min(...costs.map((entry) => entry.cost))
  return {
    vehicles: costs.filter((entry) => entry.cost === annualCostEur).map((entry) => entry.vehicle),
    annualCostEur,
  }
}
