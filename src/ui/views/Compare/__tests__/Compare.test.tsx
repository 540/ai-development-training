import { fireEvent, screen, within } from '@testing-library/react'

import { ANNUAL_KILOMETERS, SPAIN_ENERGY_PRICES } from '@/core/Vehicle/domain/spainEnergyCost'
import { bz4xDTO, camryDTO } from '@/test/fixtures'
import { mockFuelEconomyApi } from '@/test/utils/fuelEconomyApi'
import { render } from '@/test/utils/render'
import { TEXTS } from '@/ui/texts/texts'
import { formatNumber, formatPrice } from '@/ui/utils/format'
import { Compare } from '../Compare'

const compare = (ids: string[]) => localStorage.setItem('comparedVehicles', JSON.stringify(ids))

const spainCostAssumptions = () =>
  TEXTS.compare.costAssumptionsInSpain(
    formatNumber(ANNUAL_KILOMETERS),
    formatPrice(SPAIN_ENERGY_PRICES.gasolineEurPerLiter),
    formatPrice(SPAIN_ENERGY_PRICES.dieselEurPerLiter),
    formatPrice(SPAIN_ENERGY_PRICES.electricityEurPerKwh),
  )

describe('Compare', () => {
  it('asks to pick vehicles when there is nothing to compare', () => {
    render(<Compare />)

    expect(screen.getByText(TEXTS.compare.empty)).toBeInTheDocument()
  })

  it('shows the chosen vehicles side by side and highlights the best value of each row', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    compare(['47085', '47219'])

    render(<Compare />)

    expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
    const co2Row = screen.getByText(TEXTS.compare.co2).closest('tr')
    expect(within(co2Row!).getByText('0')).toHaveClass(/best/)
    expect(within(co2Row!).getByText('210')).not.toHaveClass(/best/)
  })

  it('removes a vehicle from the comparison', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    compare(['47085', '47219'])
    render(<Compare />)
    await screen.findByText('Toyota Camry')

    fireEvent.click(screen.getAllByText(TEXTS.compare.remove)[0])

    expect(await screen.findByText('Toyota bZ4X Limited')).toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry')).not.toBeInTheDocument()
  })

  it('shows the yearly energy cost in Spain and names the cheapest vehicle', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    compare(['47085', '47219'])

    render(<Compare />)

    await screen.findByText('Toyota Camry')
    const spainRow = screen.getByText(TEXTS.compare.energyCostInSpain).closest('tr')
    expect(within(spainRow!).getByText(formatNumber(561))).toHaveClass(/best/)
    expect(within(spainRow!).getByText(formatNumber(2160))).not.toHaveClass(/best/)
    expect(screen.getByText(TEXTS.compare.cheapestInSpain('Toyota bZ4X Limited', formatNumber(561)))).toBeInTheDocument()
    expect(screen.getByText(spainCostAssumptions())).toBeInTheDocument()
  })

  it('names every tied vehicle, separated by commas', async () => {
    const bz4xXleDTO = { ...bz4xDTO, id: '47220', model: 'bZ4X XLE' }
    mockFuelEconomyApi([bz4xDTO, bz4xXleDTO])
    compare(['47219', '47220'])

    render(<Compare />)

    await screen.findByText('Toyota bZ4X XLE')
    expect(
      screen.getByText(TEXTS.compare.cheapestInSpain('Toyota bZ4X Limited, Toyota bZ4X XLE', formatNumber(561))),
    ).toBeInTheDocument()
  })

  it('names no cheapest vehicle when there is a single one', async () => {
    mockFuelEconomyApi([camryDTO])
    compare(['47085'])

    render(<Compare />)

    await screen.findByText('Toyota Camry')
    expect(screen.getByText(TEXTS.compare.energyCostInSpain)).toBeInTheDocument()
    expect(screen.getByText(spainCostAssumptions())).toBeInTheDocument()
    const verdictPrefix = TEXTS.compare.cheapestInSpain('', '').split(':')[0]
    expect(screen.queryByText(verdictPrefix, { exact: false })).not.toBeInTheDocument()
  })
})
