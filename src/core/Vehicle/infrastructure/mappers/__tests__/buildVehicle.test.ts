import { bz4xDTO, camryDTO, priusPrimeDTO } from '@/test/fixtures'
import { buildVehicle, toMenuItems } from '../buildVehicle'

describe('buildVehicle', () => {
  it('turns a gasoline vehicle into European units', () => {
    const vehicle = buildVehicle(camryDTO, 'Auto (S8), 6 cyl, 3.5 L')

    expect(vehicle).toMatchObject({
      id: '47085',
      year: 2024,
      trim: 'Auto (S8), 6 cyl, 3.5 L',
      fuel: 'gasoline',
      cylinders: 6,
      displacement: 3.5,
      liters: { city: 10.7, highway: 7.1, combined: 9 },
      electricity: null,
      co2: 210,
      range: null,
    })
  })

  it('gives an electric vehicle kWh/100 km and no liters, since its MPG figures are MPGe', () => {
    const vehicle = buildVehicle(bz4xDTO)

    expect(vehicle.fuel).toBe('electric')
    expect(vehicle.liters).toBeNull()
    expect(vehicle.electricity).toEqual({ city: 17.3, highway: 20.5, combined: 18.7 })
    expect(vehicle.range).toBe(380)
    expect(vehicle.cylinders).toBeNull()
  })

  it('gives a plug-in hybrid both liters and kWh, and its electric range in km', () => {
    const vehicle = buildVehicle(priusPrimeDTO)

    expect(vehicle.fuel).toBe('plugInHybrid')
    expect(vehicle.liters?.combined).toBe(4.5)
    expect(vehicle.electricity?.combined).toBe(16.2)
    expect(vehicle.electricRange).toBe(72)
    expect(vehicle.utilityFactor).toBe(0.71)
  })

  it('treats a vehicle with no alternative fuel as gasoline', () => {
    expect(buildVehicle({ ...camryDTO, atvType: null }).fuel).toBe('gasoline')
  })
})

describe('toMenuItems', () => {
  const item = { text: 'Camry', value: 'Camry' }

  it('keeps a list as it is', () => {
    expect(toMenuItems({ menuItem: [item, item] })).toEqual([item, item])
  })

  it('wraps a single entry in a list', () => {
    expect(toMenuItems({ menuItem: item })).toEqual([item])
  })

  it('gives no entries when the menu is null', () => {
    expect(toMenuItems(null)).toEqual([])
  })
})
