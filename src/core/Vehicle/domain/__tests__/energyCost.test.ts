import { bz4x, camry } from '@/test/fixtures'
import {
  annualEnergyCostEur,
  ENERGY_PRICES_MONTH,
  KILOMETERS_PER_YEAR,
  SPAIN_ENERGY_PRICES,
} from '../energyCost'
import { Consumption } from '../Vehicle'
import { energyCost } from './__cases__/energyCost.cases'

const consumption = (combined: number | null): Consumption | null =>
  combined === null ? null : { city: combined, highway: combined, combined }

describe('energy cost in Spain', () => {
  it('assumes Spanish energy prices and yearly kilometers', () => {
    expect(SPAIN_ENERGY_PRICES).toEqual({
      gasolineEurPerLiter: energyCost.fixtures.gasolinePrice,
      dieselEurPerLiter: energyCost.fixtures.dieselPrice,
      electricityEurPerKwh: energyCost.fixtures.electricityPrice,
    })
    expect(KILOMETERS_PER_YEAR).toBe(energyCost.fixtures.kilometersPerYear)
    expect(ENERGY_PRICES_MONTH).toEqual({ year: 2026, month: 9 })
  })

  it.each(energyCost.cases)(
    '$id: $fuel with $litersCombined L, $electricityCombined kWh and utility factor $utilityFactor costs $annualCostEur €',
    ({ fuel, litersCombined, electricityCombined, utilityFactor, annualCostEur }) => {
      const vehicle = {
        ...camry,
        fuel,
        utilityFactor,
        liters: consumption(litersCombined),
        electricity: consumption(electricityCombined),
      }

      expect(annualEnergyCostEur(vehicle)).toBe(annualCostEur)
    },
  )

  it('prices real vehicles', () => {
    expect(annualEnergyCostEur(camry)).toBe(2016)
    expect(annualEnergyCostEur(bz4x)).toBe(359)
  })
})
