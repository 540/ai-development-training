import { camryDTO } from '@/test/fixtures'
import { fuelEconomyInfraRepository } from '../FuelEconomy.infra.repository'

const fetchMock = vitest.fn()

const respond = (body: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)

describe('fuelEconomyInfraRepository', () => {
  beforeEach(() => {
    globalThis.fetch = fetchMock
    vitest.clearAllMocks()
  })

  it('asks for JSON, since the API answers in XML otherwise', async () => {
    fetchMock.mockReturnValueOnce(respond(camryDTO))

    await fuelEconomyInfraRepository.findById('47085')

    expect(fetchMock).toHaveBeenCalledWith('https://www.fueleconomy.gov/ws/rest/vehicle/47085', {
      headers: { Accept: 'application/json' },
    })
  })

  it('lists the versions of every model of a make, with their trim', async () => {
    fetchMock
      .mockReturnValueOnce(respond({ menuItem: { text: 'Camry', value: 'Camry' } }))
      .mockReturnValueOnce(respond({ menuItem: [{ text: 'Auto (S8), 6 cyl, 3.5 L', value: '47085' }] }))
      .mockReturnValueOnce(respond(camryDTO))

    const vehicles = await fuelEconomyInfraRepository.listByYearAndMake(2024, 'Toyota')

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=2024&make=Toyota',
      expect.anything()
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=2024&make=Toyota&model=Camry',
      expect.anything()
    )
    expect(vehicles.map(({ id, trim }) => [id, trim])).toEqual([['47085', 'Auto (S8), 6 cyl, 3.5 L']])
  })

  it('lists nothing when the make has no models that year', async () => {
    fetchMock.mockReturnValueOnce(respond(null))

    expect(await fuelEconomyInfraRepository.listByYearAndMake(1998, 'Tesla')).toEqual([])
  })

  it('fails when the API does not answer ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false } as Response)

    await expect(fuelEconomyInfraRepository.findById('0')).rejects.toThrow()
  })
})
