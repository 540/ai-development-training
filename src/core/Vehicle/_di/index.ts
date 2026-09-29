import { setVehicleRepository } from '@/core/Vehicle/services/Vehicle.service'
import { fuelEconomyInfraRepository } from '@/core/Vehicle/infrastructure/FuelEconomy.infra.repository'

export const injectVehicleDependencies = () => {
  setVehicleRepository(fuelEconomyInfraRepository)
}
