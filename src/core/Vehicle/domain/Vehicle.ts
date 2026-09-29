/** Every kind of fuel a vehicle can run on */
export const FUEL_KINDS = [
  'gasoline',
  'diesel',
  'hybrid',
  'plugInHybrid',
  'electric',
  'flexFuel',
  'naturalGas',
  'bifuelNaturalGas',
  'bifuelLpg',
  'hydrogen',
] as const

/** A single kind of fuel */
export type FuelKind = (typeof FUEL_KINDS)[number]

/** Consumption in a driving cycle: city, highway and the combination of both */
export interface Consumption {
  city: number
  highway: number
  combined: number
}

/**
 * Shape of a vehicle version, in European units
 */
export interface Vehicle {
  /** Unique identifier of the version */
  id: string
  /** Model year */
  year: number
  make: string
  model: string
  /** Short description of the version (gearbox, engine), only known when listing */
  trim?: string
  fuel: FuelKind
  /** Fuel description as given by the source (e.g. "Regular Gas and Electricity") */
  fuelType: string
  /** Vehicle class as given by the source (e.g. "Midsize Cars") */
  vehicleClass: string
  /** Driven wheels as given by the source (e.g. "Front-Wheel Drive") */
  drive: string
  /** Gearbox as given by the source (e.g. "Automatic (S8)") */
  transmission: string
  cylinders: number | null
  /** Engine displacement in liters */
  displacement: number | null
  /** Electric motor description, empty when there is none */
  electricMotor: string
  /** Fuel consumption in L/100 km, null for electric vehicles */
  liters: Consumption | null
  /** Electricity consumption in kWh/100 km, null when the vehicle does not plug in */
  electricity: Consumption | null
  /** Tailpipe CO₂ in g/km */
  co2: number
  /** Yearly fuel cost estimated by the source, in US dollars */
  annualFuelCostUsd: number
  /** Total range in km, null when unknown */
  range: number | null
  /** Range on electricity only in km, null when unknown */
  electricRange: number | null
  /** Share of kilometers a plug-in hybrid drives on electricity, from 0 to 1 */
  utilityFactor: number
  /** Fuel economy score, from 1 to 10 */
  fuelEconomyScore: number
  /** Greenhouse gas score, from 1 to 10 */
  greenhouseGasScore: number
  /** Five-year fuel savings against the average new vehicle, in US dollars; negative means extra spending */
  fiveYearSavingsUsd: number
}

/** Years the catalog can be browsed by, newest first */
export const VEHICLE_YEARS: number[] = Array.from({ length: 2026 - 1995 + 1 }, (_, index) => 2026 - index)

/** Makes the catalog can be browsed by */
export const VEHICLE_MAKES = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Tesla',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volvo',
  'Mazda',
  'Subaru',
  'Nissan',
  'Porsche',
] as const

/** How many vehicles can be compared at once */
export const MAX_COMPARED_VEHICLES = 3
