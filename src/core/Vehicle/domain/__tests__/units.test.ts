import { gramsPerMileToGramsPerKilometer, kwhPer100Km, litersPer100Km, milesToKilometers } from '../units'

describe('units', () => {
  it('turns miles per gallon into liters per 100 km, which is the inverse and not a proportion', () => {
    expect(litersPer100Km(17)).toBe(13.8)
    expect(litersPer100Km(52)).toBe(4.5)
  })

  it('turns kWh per 100 miles into kWh per 100 km', () => {
    expect(kwhPer100Km(43.2259)).toBe(26.9)
  })

  it('turns miles into kilometers', () => {
    expect(milesToKilometers(45)).toBe(72)
  })

  it('turns grams per mile into grams per kilometer', () => {
    expect(gramsPerMileToGramsPerKilometer(386.4)).toBe(240)
  })

  it('has no figure when the source gives zero', () => {
    expect(litersPer100Km(0)).toBeNull()
    expect(kwhPer100Km(0)).toBeNull()
    expect(milesToKilometers(0)).toBeNull()
    expect(gramsPerMileToGramsPerKilometer(0)).toBe(0)
  })
})
