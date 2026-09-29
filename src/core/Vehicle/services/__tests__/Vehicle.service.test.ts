import { VehicleRepository } from '@/core/Vehicle/domain/VehicleRepository'
import { injectVehicleDependencies } from '@/core/Vehicle/_di'
import { camry } from '@/test/fixtures'
import { setVehicleRepository, vehicleService } from '../Vehicle.service'

const repository: VehicleRepository = {
  listByYearAndMake: vitest.fn().mockResolvedValue([camry]),
  findById: vitest.fn().mockResolvedValue(camry),
}

describe('vehicleService', () => {
  beforeEach(() => {
    setVehicleRepository(repository)
  })

  afterAll(() => {
    injectVehicleDependencies()
  })

  it('lists the vehicles of a year and make through the repository', async () => {
    const vehicles = await vehicleService.listByYearAndMake(2024, 'Toyota')

    expect(repository.listByYearAndMake).toHaveBeenCalledWith(2024, 'Toyota')
    expect(vehicles).toEqual([camry])
  })

  it('finds a vehicle through the repository', async () => {
    const vehicle = await vehicleService.findById('47085')

    expect(repository.findById).toHaveBeenCalledWith('47085')
    expect(vehicle).toEqual(camry)
  })
})
