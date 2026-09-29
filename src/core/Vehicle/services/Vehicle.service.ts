import { VehicleRepository } from '../domain/VehicleRepository'

let vehicleRepository: VehicleRepository

export const vehicleService = {
  listByYearAndMake: (year: number, make: string) => vehicleRepository.listByYearAndMake(year, make),
  findById: (id: string) => vehicleRepository.findById(id),
}

export const setVehicleRepository = (repository: VehicleRepository) => {
  vehicleRepository = repository
}
