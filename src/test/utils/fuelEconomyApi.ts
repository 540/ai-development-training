import { VehicleDTO } from '@/core/Vehicle/infrastructure/dto/Vehicle.dto'

const respond = (body: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)

/**
 * Makes fetch answer like fueleconomy.gov for a single model with the given versions,
 * and for each version by its id.
 */
export const mockFuelEconomyApi = (vehicles: VehicleDTO[]) => {
  globalThis.fetch = vitest.fn((input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('/menu/model')) {
      return respond({ menuItem: { text: 'Model', value: 'Model' } })
    }
    if (url.includes('/menu/options')) {
      return respond({ menuItem: vehicles.map(({ id, trany }) => ({ text: trany, value: id })) })
    }
    const vehicle = vehicles.find(({ id }) => url.endsWith(`/vehicle/${id}`))
    return vehicle ? respond(vehicle) : Promise.resolve({ ok: false } as Response)
  })
}

export const mockFailingFuelEconomyApi = () => {
  globalThis.fetch = vitest.fn(() => Promise.reject(new Error('Network error')))
}
