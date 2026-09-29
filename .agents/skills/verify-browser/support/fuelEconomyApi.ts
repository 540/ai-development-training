import type { Page } from '@playwright/test'

import type { VehicleDTO } from '../../../../src/core/Vehicle/infrastructure/dto/Vehicle.dto'
import { bz4xDTO, camryDTO, priusPrimeDTO } from '../../../../src/test/fixtures'

/** A gasoline, a plug-in hybrid and an electric car, all 2024 Toyota */
export const VEHICLES: VehicleDTO[] = [camryDTO, priusPrimeDTO, bz4xDTO]

export { bz4xDTO, camryDTO, priusPrimeDTO }

const FUEL_ECONOMY_API = 'https://www.fueleconomy.gov/ws/rest'

/** A vehicle for the spec, starting from the Camry and overriding what the criterion needs */
export const vehicleDTO = (id: string, model: string, overrides: Partial<VehicleDTO> = {}): VehicleDTO => ({
  ...camryDTO,
  ...overrides,
  id,
  model,
})

/**
 * Answers like fueleconomy.gov for any year and make: a single model whose versions are the given vehicles,
 * and each vehicle by its id. Any other route answers 404 with "Not mocked: <path>".
 */
export const mockFuelEconomyApi = async (page: Page, vehicles: VehicleDTO[] = VEHICLES) => {
  await page.route(`${FUEL_ECONOMY_API}/**`, (route) => {
    const url = new URL(route.request().url())
    if (url.pathname.endsWith('/vehicle/menu/model')) {
      return route.fulfill({ json: { menuItem: { text: 'Model', value: 'Model' } } })
    }
    if (url.pathname.endsWith('/vehicle/menu/options')) {
      return route.fulfill({ json: { menuItem: vehicles.map(({ id, trany }) => ({ text: trany, value: id })) } })
    }
    const byId = url.pathname.match(/\/vehicle\/(\d+)$/)
    if (byId) {
      const found = vehicles.find(({ id }) => id === byId[1])
      return found ? route.fulfill({ json: found }) : route.fulfill({ status: 404, body: 'Not found' })
    }
    return route.fulfill({ status: 404, body: `Not mocked: ${url.pathname}` })
  })
}
