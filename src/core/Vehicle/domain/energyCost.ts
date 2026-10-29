import { FuelKind, Vehicle } from './Vehicle'

/**
 * Energy prices in Spain, an assumption: the source has no prices at all.
 * Gasoline 95 and diesel: EU Weekly Oil Bulletin, prices of 2026-09-14.
 * Electricity: average household regulated tariff (PVPC) in 2026, charging at home.
 */
export const SPAIN_ENERGY_PRICES = {
  gasolineEurPerLiter: 1.867,
  dieselEurPerLiter: 1.834,
  electricityEurPerKwh: 0.16,
} as const

/** Month the energy prices are shown as */
export const ENERGY_PRICES_MONTH = { year: 2026, month: 9 } as const

/** Kilometers driven in a year, the Spanish average (DGT, IDAE) */
export const KILOMETERS_PER_YEAR = 12000

const perYear = (per100Km: number, price: number): number => ((per100Km * KILOMETERS_PER_YEAR) / 100) * price

const gasolineCost = (vehicle: Vehicle): number | null =>
  vehicle.liters ? perYear(vehicle.liters.combined, SPAIN_ENERGY_PRICES.gasolineEurPerLiter) : null

const dieselCost = (vehicle: Vehicle): number | null =>
  vehicle.liters ? perYear(vehicle.liters.combined, SPAIN_ENERGY_PRICES.dieselEurPerLiter) : null

const electricityCost = (vehicle: Vehicle): number | null =>
  vehicle.electricity ? perYear(vehicle.electricity.combined, SPAIN_ENERGY_PRICES.electricityEurPerKwh) : null

/** A plug-in hybrid drives the utility factor share on electricity and the rest on gasoline */
const plugInHybridCost = (vehicle: Vehicle): number | null => {
  if (vehicle.utilityFactor === 0) {
    return gasolineCost(vehicle)
  }
  const gasoline = gasolineCost(vehicle)
  const electricity = electricityCost(vehicle)
  if (gasoline === null || electricity === null) {
    return null
  }
  return vehicle.utilityFactor * electricity + (1 - vehicle.utilityFactor) * gasoline
}

const noCost = (): null => null

const COST_BY_FUEL: Record<FuelKind, (vehicle: Vehicle) => number | null> = {
  gasoline: gasolineCost,
  hybrid: gasolineCost,
  flexFuel: gasolineCost,
  diesel: dieselCost,
  electric: electricityCost,
  plugInHybrid: plugInHybridCost,
  naturalGas: noCost,
  bifuelNaturalGas: noCost,
  bifuelLpg: noCost,
  hydrogen: noCost,
}

/**
 * Yearly energy cost in Spain, in whole euros. Null when the fuel has no Spanish price
 * or the source lacks the consumption it needs.
 */
export const annualEnergyCostEur = (vehicle: Vehicle): number | null => {
  const cost = COST_BY_FUEL[vehicle.fuel](vehicle)
  return cost === null ? null : Math.round(cost)
}

export interface CheapestByEnergyCost {
  /** Every vehicle with the lowest cost, in the order received */
  cheapest: Vehicle[]
  /** The first vehicle with the highest cost */
  priciest: Vehicle
  /** Highest cost minus lowest cost, in whole euros */
  savingEur: number
}

/**
 * Which vehicles cost the least energy in Spain and how much they save against the priciest.
 * Vehicles without a cost do not count; null when fewer than two remain.
 */
export const cheapestByEnergyCost = (vehicles: Vehicle[]): CheapestByEnergyCost | null => {
  const costed = vehicles
    .map((vehicle) => ({ vehicle, cost: annualEnergyCostEur(vehicle) }))
    .filter((entry): entry is { vehicle: Vehicle; cost: number } => entry.cost !== null)
  if (costed.length < 2) {
    return null
  }
  const costs = costed.map(({ cost }) => cost)
  const lowest = Math.min(...costs)
  const highest = Math.max(...costs)
  return {
    cheapest: costed.filter(({ cost }) => cost === lowest).map(({ vehicle }) => vehicle),
    priciest: costed[costs.indexOf(highest)].vehicle,
    savingEur: highest - lowest,
  }
}
