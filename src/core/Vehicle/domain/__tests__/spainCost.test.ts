import { bz4x, camry, priusPrime } from '@/test/fixtures'
import { FuelKind, Vehicle } from '../Vehicle'
import { annualEnergyCostInSpain, cheapestInSpain, SPAIN_COST_ASSUMPTIONS } from '../spainCost'

const diesel: Vehicle = { ...camry, fuel: 'diesel', liters: { city: 6, highway: 6, combined: 6 } }

describe('SPAIN_COST_ASSUMPTIONS', () => {
  it('keeps the yearly distance and energy prices in one place', () => {
    expect(SPAIN_COST_ASSUMPTIONS).toEqual({
      kilometersPerYear: 15000,
      gasolineEurPerLiter: 1.6,
      dieselEurPerLiter: 1.5,
      electricityEurPerKwh: 0.2,
    })
  })
})

describe('annualEnergyCostInSpain', () => {
  it('prices a gasoline vehicle with its combined liters', () => {
    expect(annualEnergyCostInSpain(camry)).toBe(2160)
  })

  it('prices an electric vehicle with its combined kWh', () => {
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
    'has no cost for %s, which has no price',
    (fuel) => {
      expect(annualEnergyCostInSpain({ ...camry, fuel })).toBeNull()
    },
  )

  it.each<[string, Vehicle]>([
    ['gasoline without liters', { ...camry, liters: null }],
    ['diesel without liters', { ...diesel, liters: null }],
    ['electric without electricity', { ...bz4x, electricity: null }],
    ['plug-in hybrid without liters', { ...priusPrime, liters: null }],
    ['plug-in hybrid without electricity', { ...priusPrime, electricity: null }],
  ])('has no cost for a %s', (_, vehicle) => {
    expect(annualEnergyCostInSpain(vehicle)).toBeNull()
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

  it('ignores vehicles without a cost', () => {
    expect(cheapestInSpain([{ ...camry, fuel: 'hydrogen' }, camry, bz4x])).toEqual({ vehicle: bz4x, annualCost: 561 })
  })

  it.each<[string, Vehicle[]]>([
    ['no vehicles', []],
    ['a single vehicle', [camry]],
    ['a single vehicle with a cost', [camry, { ...camry, fuel: 'hydrogen' }]],
  ])('picks none with %s', (_, vehicles) => {
    expect(cheapestInSpain(vehicles)).toBeNull()
  })
})
