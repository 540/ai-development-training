import { FuelKind, Vehicle } from './Vehicle'

/** Business assumptions behind every cost in Spain: the source gives no prices nor yearly distance */
export const SPAIN_COST_ASSUMPTIONS = {
  kilometersPerYear: 15000,
  gasolineEurPerLiter: 1.6,
  dieselEurPerLiter: 1.5,
  electricityEurPerKwh: 0.2,
} as const

const HUNDREDS_OF_KM_PER_YEAR = SPAIN_COST_ASSUMPTIONS.kilometersPerYear / 100

const fuelCost = (litersPer100Km: number, eurPerLiter: number): number =>
  litersPer100Km * HUNDREDS_OF_KM_PER_YEAR * eurPerLiter

const electricityCost = (kwhPer100Km: number): number =>
  kwhPer100Km * HUNDREDS_OF_KM_PER_YEAR * SPAIN_COST_ASSUMPTIONS.electricityEurPerKwh

const gasolineCost = (vehicle: Vehicle): number | null =>
  vehicle.liters ? fuelCost(vehicle.liters.combined, SPAIN_COST_ASSUMPTIONS.gasolineEurPerLiter) : null

const dieselCost = (vehicle: Vehicle): number | null =>
  vehicle.liters ? fuelCost(vehicle.liters.combined, SPAIN_COST_ASSUMPTIONS.dieselEurPerLiter) : null

const electricCost = (vehicle: Vehicle): number | null =>
  vehicle.electricity ? electricityCost(vehicle.electricity.combined) : null

/** A plug-in hybrid drives the utility factor share on electricity and the rest on gasoline */
const plugInHybridCost = (vehicle: Vehicle): number | null => {
  if (!vehicle.liters || !vehicle.electricity) {
    return null
  }
  return (
    vehicle.utilityFactor * electricityCost(vehicle.electricity.combined) +
    (1 - vehicle.utilityFactor) * fuelCost(vehicle.liters.combined, SPAIN_COST_ASSUMPTIONS.gasolineEurPerLiter)
  )
}

const noPrice = (): null => null

const COST_BY_FUEL: Record<FuelKind, (vehicle: Vehicle) => number | null> = {
  gasoline: gasolineCost,
  diesel: dieselCost,
  hybrid: gasolineCost,
  plugInHybrid: plugInHybridCost,
  electric: electricCost,
  flexFuel: gasolineCost,
  naturalGas: noPrice,
  bifuelNaturalGas: noPrice,
  bifuelLpg: noPrice,
  hydrogen: noPrice,
}

/**
 * Yearly energy cost in Spain, in whole euros, from the combined consumption
 * and SPAIN_COST_ASSUMPTIONS. Null when there is no price for the fuel or the
 * consumption it needs is missing.
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
 * Null when fewer than two vehicles have a cost.
 */
export const cheapestInSpain = (vehicles: Vehicle[]): CheapestInSpain | null => {
  const costs = vehicles.flatMap((vehicle) => {
    const annualCost = annualEnergyCostInSpain(vehicle)
    return annualCost === null ? [] : [{ vehicle, annualCost }]
  })
  if (costs.length < 2) {
    return null
  }
  return costs.reduce((cheapest, candidate) => (candidate.annualCost < cheapest.annualCost ? candidate : cheapest))
}
