import { FuelKind, Vehicle } from './Vehicle'

/**
 * Energy prices assumed for Spain. The source gives no prices for Spain, so these are
 * rounded, indicative figures kept here as the single place to change them.
 */
export const SPAIN_ENERGY_PRICES = {
  gasolineEurPerLiter: 1.5,
  dieselEurPerLiter: 1.4,
  electricityEurPerKwh: 0.2,
} as const

/** Kilometers a car is assumed to drive in a year in Spain */
export const SPAIN_ANNUAL_KILOMETERS = 15000

type CostPer100Km = (vehicle: Vehicle) => number | null

const gasolineCost: CostPer100Km = ({ liters }) =>
  liters && liters.combined * SPAIN_ENERGY_PRICES.gasolineEurPerLiter

const dieselCost: CostPer100Km = ({ liters }) => liters && liters.combined * SPAIN_ENERGY_PRICES.dieselEurPerLiter

const electricityCost: CostPer100Km = ({ electricity }) =>
  electricity && electricity.combined * SPAIN_ENERGY_PRICES.electricityEurPerKwh

const plugInHybridCost: CostPer100Km = (vehicle) => {
  const electric = electricityCost(vehicle)
  const gasoline = gasolineCost(vehicle)
  if (electric === null || gasoline === null) {
    return null
  }
  return vehicle.utilityFactor * electric + (1 - vehicle.utilityFactor) * gasoline
}

const noCost: CostPer100Km = () => null

/** Energy cost every 100 km by fuel; fuels with no assumed price have no cost */
const COST_PER_100_KM: Record<FuelKind, CostPer100Km> = {
  gasoline: gasolineCost,
  diesel: dieselCost,
  hybrid: gasolineCost,
  plugInHybrid: plugInHybridCost,
  electric: electricityCost,
  flexFuel: gasolineCost,
  naturalGas: noCost,
  bifuelNaturalGas: gasolineCost,
  bifuelLpg: gasolineCost,
  hydrogen: noCost,
}

/** Yearly energy cost in Spain, in euros rounded to the unit; null when it cannot be worked out */
export const annualEnergyCostEur = (vehicle: Vehicle): number | null => {
  const costPer100Km = COST_PER_100_KM[vehicle.fuel](vehicle)
  return costPer100Km === null ? null : Math.round((costPer100Km * SPAIN_ANNUAL_KILOMETERS) / 100)
}

export interface CheapestVehicle {
  vehicle: Vehicle
  cost: number
}

/** The vehicle with the lowest yearly energy cost in Spain; the first one wins a tie. Null with fewer than two costs */
export const cheapestInSpain = (vehicles: Vehicle[]): CheapestVehicle | null => {
  const costs = vehicles.flatMap((vehicle) => {
    const cost = annualEnergyCostEur(vehicle)
    return cost === null ? [] : [{ vehicle, cost }]
  })
  if (costs.length < 2) {
    return null
  }
  return costs.reduce((cheapest, candidate) => (candidate.cost < cheapest.cost ? candidate : cheapest))
}
