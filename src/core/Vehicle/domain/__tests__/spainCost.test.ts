import { bz4x, camry, priusPrime } from '@/test/fixtures'
import { annualEnergyCostInSpain, cheapestInSpain, SPAIN_COST_ASSUMPTIONS } from '../spainCost'
import { FuelKind } from '../Vehicle'

const diesel = { ...camry, fuel: 'diesel' as const, liters: { city: 6, highway: 6, combined: 6 } }
const hydrogenCamry = { ...camry, fuel: 'hydrogen' as const }

describe('SPAIN_COST_ASSUMPTIONS', () => {
  it('keeps the yearly distance and the Spanish energy prices', () => {
    expect(SPAIN_COST_ASSUMPTIONS).toEqual({
      kilometersPerYear: 15000,
      gasolineEurPerLiter: 1.6,
      dieselEurPerLiter: 1.5,
      electricityEurPerKwh: 0.2,
    })
  })
})

describe('annualEnergyCostInSpain', () => {
  it('prices a gasoline vehicle with the gasoline price', () => {
    expect(annualEnergyCostInSpain(camry)).toBe(2160)
  })

  it('prices an electric vehicle with the electricity price', () => {
    expect(annualEnergyCostInSpain(bz4x)).toBe(561)
  })

  it('splits the kilometers of a plug-in hybrid by its utility factor', () => {
    expect(annualEnergyCostInSpain(priusPrime)).toBe(658)
  })

  it('prices a diesel vehicle with the diesel price', () => {
    expect(annualEnergyCostInSpain(diesel)).toBe(1350)
  })

  it.each<FuelKind>(['hybrid', 'flexFuel'])('prices a %s vehicle with the gasoline price', (fuel) => {
    expect(annualEnergyCostInSpain({ ...camry, fuel })).toBe(2160)
  })

  it('rounds to the nearest euro', () => {
    const electricity = { city: 18.72, highway: 18.72, combined: 18.72 }
    expect(annualEnergyCostInSpain({ ...bz4x, electricity })).toBe(562)
  })

  it.each<FuelKind>(['naturalGas', 'bifuelNaturalGas', 'bifuelLpg', 'hydrogen'])(
    'has no cost for a %s vehicle, which has no Spanish price',
    (fuel) => {
      expect(annualEnergyCostInSpain({ ...camry, fuel })).toBeNull()
    },
  )

  it('has no cost when the consumption it needs is unknown', () => {
    expect(annualEnergyCostInSpain({ ...camry, liters: null })).toBeNull()
    expect(annualEnergyCostInSpain({ ...diesel, liters: null })).toBeNull()
    expect(annualEnergyCostInSpain({ ...bz4x, electricity: null })).toBeNull()
    expect(annualEnergyCostInSpain({ ...priusPrime, liters: null })).toBeNull()
    expect(annualEnergyCostInSpain({ ...priusPrime, electricity: null })).toBeNull()
  })

  it('has no cost for a plug-in hybrid without a valid utility factor', () => {
    expect(annualEnergyCostInSpain({ ...priusPrime, utilityFactor: 0 })).toBeNull()
    expect(annualEnergyCostInSpain({ ...priusPrime, utilityFactor: -1 })).toBeNull()
    expect(annualEnergyCostInSpain({ ...priusPrime, utilityFactor: 1.01 })).toBeNull()
  })

  it('prices a plug-in hybrid with a utility factor of 1 as fully electric', () => {
    expect(annualEnergyCostInSpain({ ...priusPrime, utilityFactor: 1 })).toBe(486)
  })
})

describe('cheapestInSpain', () => {
  it('picks the vehicle with the lowest yearly cost', () => {
    expect(cheapestInSpain([camry, bz4x])).toEqual({ vehicle: bz4x, annualCost: 561 })
    expect(cheapestInSpain([bz4x, camry])).toEqual({ vehicle: bz4x, annualCost: 561 })
  })

  it('keeps the first vehicle on a tie', () => {
    expect(cheapestInSpain([camry, { ...camry, id: 'x' }])?.vehicle.id).toBe('47085')
  })

  it('ignores the vehicles without a cost', () => {
    expect(cheapestInSpain([hydrogenCamry, camry, bz4x])).toEqual({ vehicle: bz4x, annualCost: 561 })
  })

  it('has none when fewer than two vehicles have a cost', () => {
    expect(cheapestInSpain([])).toBeNull()
    expect(cheapestInSpain([camry])).toBeNull()
    expect(cheapestInSpain([camry, hydrogenCamry])).toBeNull()
  })
})
