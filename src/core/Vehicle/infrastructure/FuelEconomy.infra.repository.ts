import { VehicleRepository } from '../domain/VehicleRepository'
import { MenuDTO, VehicleDTO } from './dto/Vehicle.dto'
import { buildVehicle, toMenuItems } from './mappers/buildVehicle'

const FUEL_ECONOMY_API_URL = 'https://www.fueleconomy.gov/ws/rest'

// Without this header the API answers in XML
const getJSON = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${FUEL_ECONOMY_API_URL}${path}`, { headers: { Accept: 'application/json' } })

  if (!response.ok) {
    throw new Error(`Error fetching ${path}`)
  }

  return response.json()
}

const query = (params: Record<string, string | number>) =>
  new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)])).toString()

// The API has no listing endpoint: models of a make, then the versions of each model, then each version
export const fuelEconomyInfraRepository: VehicleRepository = {
  listByYearAndMake: async (year, make) => {
    const models = toMenuItems(await getJSON<MenuDTO>(`/vehicle/menu/model?${query({ year, make })}`))
    const versionMenus = await Promise.all(
      models.map(({ value: model }) => getJSON<MenuDTO>(`/vehicle/menu/options?${query({ year, make, model })}`))
    )
    const versions = versionMenus.flatMap(toMenuItems)

    return Promise.all(
      versions.map(async ({ value: id, text: trim }) => buildVehicle(await getJSON<VehicleDTO>(`/vehicle/${id}`), trim))
    )
  },
  findById: async (id) => buildVehicle(await getJSON<VehicleDTO>(`/vehicle/${id}`)),
}
