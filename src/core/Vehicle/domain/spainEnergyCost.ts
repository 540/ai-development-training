import { FuelKind, Vehicle } from './Vehicle'

/** Kilometers a car is assumed to drive in a year in Spain */
export const KILOMETERS_PER_YEAR = 12_000

/** Reference energy prices in Spain, in euros; the source does not give them */
export const SPAIN_ENERGY_PRICES = {
  gasolineEurosPerLiter: 1.6,
  dieselEurosPerLiter: 1.5,
  electricityEurosPerKwh: 0.2,
}

/** Price of a liter of the fuel each kind burns; null when there is no assumed price */
const FUEL_PRICE_PER_LITER: Record<FuelKind, number | null> = {
  gasoline: SPAIN_ENERGY_PRICES.gasolineEurosPerLiter,
  diesel: SPAIN_ENERGY_PRICES.dieselEurosPerLiter,
  hybrid: SPAIN_ENERGY_PRICES.gasolineEurosPerLiter,
  plugInHybrid: SPAIN_ENERGY_PRICES.gasolineEurosPerLiter,
  electric: null,
  flexFuel: SPAIN_ENERGY_PRICES.gasolineEurosPerLiter,
  naturalGas: null,
  bifuelNaturalGas: SPAIN_ENERGY_PRICES.gasolineEurosPerLiter,
  bifuelLpg: SPAIN_ENERGY_PRICES.gasolineEurosPerLiter,
  hydrogen: null,
}

const costPer100Km = (vehicle: Vehicle): number | null => {
  const { liters, electricity } = vehicle
  if (vehicle.fuel === 'electric') {
    return electricity ? electricity.combined * SPAIN_ENERGY_PRICES.electricityEurosPerKwh : null
  }
  const pricePerLiter = FUEL_PRICE_PER_LITER[vehicle.fuel]
  if (!liters || pricePerLiter === null) {
    return null
  }
  const fuelCost = liters.combined * pricePerLiter
  if (vehicle.fuel === 'plugInHybrid' && electricity) {
    const electricCost = electricity.combined * SPAIN_ENERGY_PRICES.electricityEurosPerKwh
    return vehicle.utilityFactor * electricCost + (1 - vehicle.utilityFactor) * fuelCost
  }
  return fuelCost
}

/**
 * Yearly energy cost of a vehicle in Spain, in whole euros, using its combined
 * consumption. Null when it cannot be estimated (no consumption, natural gas, hydrogen).
 */
export const annualEnergyCostInSpain = (vehicle: Vehicle): number | null => {
  const cost = costPer100Km(vehicle)
  return cost === null ? null : Math.round((cost * KILOMETERS_PER_YEAR) / 100)
}

export interface CheapestInSpain {
  vehicle: Vehicle
  cost: number
}

/**
 * The vehicle with the lowest yearly energy cost in Spain; on a tie, the first one.
 * Null when fewer than two vehicles have a cost to compare.
 */
export const cheapestInSpain = (vehicles: Vehicle[]): CheapestInSpain | null => {
  const costed = vehicles.flatMap((vehicle) => {
    const cost = annualEnergyCostInSpain(vehicle)
    return cost === null ? [] : [{ vehicle, cost }]
  })
  if (costed.length < 2) {
    return null
  }
  return costed.reduce((cheapest, candidate) => (candidate.cost < cheapest.cost ? candidate : cheapest))
}
