/** Kilometers in a mile */
export const KILOMETERS_PER_MILE = 1.609344

/** 100 km in miles divided by the liters in a US gallon: turns MPG into L/100 km */
const MPG_TO_LITERS_PER_100_KM = 235.215

const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Miles per US gallon to liters per 100 km, rounded to one decimal; null when there is no figure */
export const litersPer100Km = (milesPerGallon: number): number | null =>
  milesPerGallon > 0 ? roundTo(MPG_TO_LITERS_PER_100_KM / milesPerGallon, 1) : null

/** kWh per 100 miles to kWh per 100 km, rounded to one decimal; null when there is no figure */
export const kwhPer100Km = (kwhPer100Miles: number): number | null =>
  kwhPer100Miles > 0 ? roundTo(kwhPer100Miles / KILOMETERS_PER_MILE, 1) : null

/** Miles to kilometers, rounded to the unit; null when there is no figure */
export const milesToKilometers = (miles: number): number | null =>
  miles > 0 ? Math.round(miles * KILOMETERS_PER_MILE) : null

/** Grams per mile to grams per kilometer, rounded to the unit */
export const gramsPerMileToGramsPerKilometer = (gramsPerMile: number): number =>
  gramsPerMile > 0 ? Math.round(gramsPerMile / KILOMETERS_PER_MILE) : 0
