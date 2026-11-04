import { bz4x, camry, priusPrime } from '@/test/fixtures'
import { annualEnergyCostEur, cheapestInSpain } from '../spainEnergyCost'
import { FuelKind } from '../Vehicle'

describe('annualEnergyCostEur', () => {
  it('prices a gasoline car at 1.50 €/L over 15,000 km', () => {
    expect(annualEnergyCostEur(camry)).toBe(2025)
  })

  it.each<FuelKind>(['hybrid', 'flexFuel', 'bifuelNaturalGas', 'bifuelLpg'])('prices a %s car as gasoline', (fuel) => {
    expect(annualEnergyCostEur({ ...camry, fuel })).toBe(2025)
  })

  it('prices a diesel car at 1.40 €/L', () => {
    expect(annualEnergyCostEur({ ...camry, fuel: 'diesel' })).toBe(1890)
  })

  it('prices an electric car at 0.20 €/kWh', () => {
    expect(annualEnergyCostEur(bz4x)).toBe(561)
  })

  it('splits a plug-in hybrid between electricity and gasoline with its utility factor', () => {
    expect(annualEnergyCostEur(priusPrime)).toBe(639)
  })

  it.each<FuelKind>(['naturalGas', 'hydrogen'])('gives no cost to a %s car, which has no assumed price', (fuel) => {
    expect(annualEnergyCostEur({ ...camry, fuel })).toBeNull()
  })

  it('gives no cost when the consumption the formula needs is missing', () => {
    expect(annualEnergyCostEur({ ...camry, liters: null })).toBeNull()
    expect(annualEnergyCostEur({ ...camry, fuel: 'diesel', liters: null })).toBeNull()
    expect(annualEnergyCostEur({ ...bz4x, electricity: null })).toBeNull()
    expect(annualEnergyCostEur({ ...priusPrime, electricity: null })).toBeNull()
    expect(annualEnergyCostEur({ ...priusPrime, liters: null })).toBeNull()
  })

  it('gives no cost to a plug-in hybrid with no utility factor', () => {
    expect(annualEnergyCostEur({ ...priusPrime, utilityFactor: 0 })).toBeNull()
    expect(annualEnergyCostEur({ ...priusPrime, utilityFactor: -1 })).toBeNull()
  })
})

describe('cheapestInSpain', () => {
  it('picks the vehicle with the lowest yearly cost, whatever the order', () => {
    expect(cheapestInSpain([camry, bz4x])).toEqual({ vehicle: bz4x, cost: 561 })
    expect(cheapestInSpain([bz4x, camry])).toEqual({ vehicle: bz4x, cost: 561 })
    expect(cheapestInSpain([camry, bz4x, priusPrime])).toEqual({ vehicle: bz4x, cost: 561 })
    expect(cheapestInSpain([camry, priusPrime])).toEqual({ vehicle: priusPrime, cost: 639 })
  })

  it('needs at least two vehicles with a cost', () => {
    expect(cheapestInSpain([])).toBeNull()
    expect(cheapestInSpain([camry])).toBeNull()
    expect(cheapestInSpain([camry, { ...camry, id: 'hydrogen', fuel: 'hydrogen' }])).toBeNull()
  })

  it('leaves out vehicles with no cost', () => {
    expect(cheapestInSpain([{ ...camry, id: 'hydrogen', fuel: 'hydrogen' }, camry, bz4x])).toEqual({
      vehicle: bz4x,
      cost: 561,
    })
  })

  it('keeps the first vehicle on a tie', () => {
    const twin = { ...camry, id: 'twin' }

    expect(cheapestInSpain([camry, twin])?.vehicle).toBe(camry)
  })
})
