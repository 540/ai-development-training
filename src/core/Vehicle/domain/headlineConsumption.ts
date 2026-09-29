import { Consumption, Vehicle } from './Vehicle'

export type ConsumptionUnit = 'litersPer100Km' | 'kwhPer100Km'

export interface HeadlineConsumption {
  unit: ConsumptionUnit
  consumption: Consumption
}

/**
 * The consumption that best describes a vehicle: liters when it burns fuel,
 * kWh when it only runs on electricity. Null when the source has neither.
 */
export const headlineConsumption = (vehicle: Vehicle): HeadlineConsumption | null => {
  if (vehicle.liters) {
    return { unit: 'litersPer100Km', consumption: vehicle.liters }
  }
  if (vehicle.electricity) {
    return { unit: 'kwhPer100Km', consumption: vehicle.electricity }
  }
  return null
}
