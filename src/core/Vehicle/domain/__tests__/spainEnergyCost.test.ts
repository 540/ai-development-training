import { bz4x, camry, priusPrime } from '@/test/fixtures'
import { FuelKind } from '../Vehicle'
import { annualEnergyCostEur, cheapestInSpain } from '../spainEnergyCost'

const diesel = { ...camry, fuel: 'diesel' as const, liters: { ...camry.liters!, combined: 6 } }

describe('annualEnergyCostEur', () => {
  it('prices a gasoline car with the gasoline price', () => {
    expect(annualEnergyCostEur(camry)).toBe(2160)
  })

  it('prices an electric car with the electricity price', () => {
    expect(annualEnergyCostEur(bz4x)).toBe(561)
  })

  it('splits a plug-in hybrid between electricity and gasoline with its utility factor', () => {
    expect(annualEnergyCostEur(priusPrime)).toBe(658)
  })

  it('prices a diesel car with the diesel price', () => {
    expect(annualEnergyCostEur(diesel)).toBe(1350)
  })

  it.each<FuelKind>(['hybrid', 'flexFuel'])('prices a %s car with the gasoline price', (fuel) => {
    expect(annualEnergyCostEur({ ...camry, fuel })).toBe(2160)
  })

  it.each<FuelKind>(['naturalGas', 'bifuelNaturalGas', 'bifuelLpg', 'hydrogen'])(
    'has no cost for a %s car',
    (fuel) => {
      expect(annualEnergyCostEur({ ...camry, fuel })).toBeNull()
    },
  )

  it('has no cost when a fuel car has no liters', () => {
    expect(annualEnergyCostEur({ ...camry, liters: null })).toBeNull()
    expect(annualEnergyCostEur({ ...diesel, liters: null })).toBeNull()
  })

  it('has no cost when an electric car has no kWh', () => {
    expect(annualEnergyCostEur({ ...bz4x, electricity: null })).toBeNull()
  })

  it('has no cost when a plug-in hybrid lacks either consumption', () => {
    expect(annualEnergyCostEur({ ...priusPrime, liters: null })).toBeNull()
    expect(annualEnergyCostEur({ ...priusPrime, electricity: null })).toBeNull()
  })
})

describe('cheapestInSpain', () => {
  it('picks the vehicle with the lowest yearly cost', () => {
    expect(cheapestInSpain([camry, bz4x])).toEqual({ vehicles: [bz4x], annualCostEur: 561 })
    expect(cheapestInSpain([bz4x, camry])).toEqual({ vehicles: [bz4x], annualCostEur: 561 })
  })

  it('picks the cheapest among three', () => {
    expect(cheapestInSpain([camry, priusPrime, bz4x])).toEqual({ vehicles: [bz4x], annualCostEur: 561 })
  })

  it('names every vehicle in a tie', () => {
    const twin = { ...bz4x, id: 'x' }
    expect(cheapestInSpain([bz4x, twin, camry])).toEqual({ vehicles: [bz4x, twin], annualCostEur: 561 })
  })

  it('has no verdict with fewer than two known costs', () => {
    expect(cheapestInSpain([camry])).toBeNull()
    expect(cheapestInSpain([camry, { ...camry, fuel: 'hydrogen' }])).toBeNull()
  })

  it('ignores vehicles without a known cost', () => {
    expect(cheapestInSpain([{ ...bz4x, fuel: 'hydrogen' }, camry, priusPrime])).toEqual({
      vehicles: [priusPrime],
      annualCostEur: 658,
    })
  })
})
