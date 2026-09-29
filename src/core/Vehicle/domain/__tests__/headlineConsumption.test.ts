import { bz4x, camry } from '@/test/fixtures'
import { headlineConsumption } from '../headlineConsumption'

describe('headlineConsumption', () => {
  it('uses liters for a vehicle that burns fuel', () => {
    expect(headlineConsumption(camry)).toEqual({ unit: 'litersPer100Km', consumption: camry.liters })
  })

  it('uses kWh for an electric vehicle', () => {
    expect(headlineConsumption(bz4x)).toEqual({ unit: 'kwhPer100Km', consumption: bz4x.electricity })
  })

  it('has none when the source gives no consumption', () => {
    expect(headlineConsumption({ ...camry, liters: null, electricity: null })).toBeNull()
  })
})
