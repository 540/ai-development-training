import { bz4x, camry, priusPrime } from '@/test/fixtures'
import { FuelKind, Vehicle } from '../Vehicle'
import { annualEnergyCostInSpain, cheapestInSpain, KILOMETERS_PER_YEAR, SPAIN_ENERGY_PRICES } from '../spainEnergyCost'

const withLiters = (fuel: FuelKind, combined: number): Vehicle => ({
  ...camry,
  fuel,
  liters: { city: combined, highway: combined, combined },
})

describe('annualEnergyCostInSpain', () => {
  it('assumes 12.000 km a year and Spanish energy prices', () => {
    expect(KILOMETERS_PER_YEAR).toBe(12_000)
    expect(SPAIN_ENERGY_PRICES).toEqual({
      gasolineEurosPerLiter: 1.6,
      dieselEurosPerLiter: 1.5,
      electricityEurosPerKwh: 0.2,
    })
  })

  it('prices a gasoline car at the gasoline price', () => {
    expect(annualEnergyCostInSpain(camry)).toBe(1728)
  })

  it('prices an electric car at the electricity price, rounded to whole euros', () => {
    expect(annualEnergyCostInSpain(bz4x)).toBe(449)
  })

  it('splits a plug-in hybrid between electricity and gasoline with its utility factor', () => {
    expect(annualEnergyCostInSpain(priusPrime)).toBe(527)
  })

  it('prices a plug-in hybrid without electricity data as a gasoline car', () => {
    expect(annualEnergyCostInSpain({ ...priusPrime, electricity: null })).toBe(864)
  })

  it('prices a diesel car at the diesel price', () => {
    expect(annualEnergyCostInSpain(withLiters('diesel', 5))).toBe(900)
    expect(annualEnergyCostInSpain({ ...camry, fuel: 'diesel' })).toBe(1620)
  })

  it.each<FuelKind>(['gasoline', 'hybrid', 'flexFuel', 'bifuelNaturalGas', 'bifuelLpg'])(
    'prices a %s car at the gasoline price',
    (fuel) => {
      expect(annualEnergyCostInSpain(withLiters(fuel, 5))).toBe(960)
    },
  )

  it('ignores electricity data on a car that does not plug in', () => {
    expect(annualEnergyCostInSpain({ ...camry, electricity: bz4x.electricity, utilityFactor: 0.5 })).toBe(1728)
  })

  it.each<FuelKind>(['naturalGas', 'hydrogen', 'electric'])('has no cost for a %s car priced by liters', (fuel) => {
    expect(annualEnergyCostInSpain(withLiters(fuel, 5))).toBeNull()
  })

  it('has no cost without consumption', () => {
    expect(annualEnergyCostInSpain({ ...bz4x, electricity: null })).toBeNull()
    expect(annualEnergyCostInSpain({ ...camry, liters: null })).toBeNull()
    expect(annualEnergyCostInSpain({ ...priusPrime, liters: null })).toBeNull()
  })
})

describe('cheapestInSpain', () => {
  it('picks the vehicle with the lowest yearly energy cost, whatever the order', () => {
    expect(cheapestInSpain([camry, bz4x])).toEqual({ vehicle: bz4x, cost: 449 })
    expect(cheapestInSpain([bz4x, camry])).toEqual({ vehicle: bz4x, cost: 449 })
    expect(cheapestInSpain([camry, priusPrime, bz4x])).toEqual({ vehicle: bz4x, cost: 449 })
  })

  it('picks the first vehicle on a tie', () => {
    expect(cheapestInSpain([camry, { ...camry, id: 'x' }])).toEqual({ vehicle: camry, cost: 1728 })
  })

  it('has no cheapest when fewer than two vehicles have a cost', () => {
    expect(cheapestInSpain([camry])).toBeNull()
    expect(cheapestInSpain([camry, { ...bz4x, electricity: null }])).toBeNull()
  })

  it('leaves out vehicles without a cost', () => {
    expect(cheapestInSpain([{ ...bz4x, electricity: null }, camry, priusPrime])).toEqual({
      vehicle: priusPrime,
      cost: 527,
    })
  })
})
