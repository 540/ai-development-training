import { fireEvent, screen, within } from '@testing-library/react'

import { bz4xDTO, camryDTO } from '@/test/fixtures'
import { mockFuelEconomyApi } from '@/test/utils/fuelEconomyApi'
import { render } from '@/test/utils/render'
import { TEXTS } from '@/ui/texts/texts'
import { Compare } from '../Compare'

const compare = (ids: string[]) => localStorage.setItem('comparedVehicles', JSON.stringify(ids))

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

  it('shows the yearly energy cost in Spain and highlights the cheapest', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    compare(['47085', '47219'])

    render(<Compare />)

    await screen.findByText('Toyota Camry')
    const costRow = screen.getByText(TEXTS.compare.annualCostInSpain).closest('tr')
    expect(within(costRow!).getByText('561 €')).toHaveClass(/best/)
    expect(within(costRow!).getByText('2160 €')).not.toHaveClass(/best/)
    expect(screen.getByText(TEXTS.compare.cheapestInSpain('Toyota bZ4X Limited', '561 €'))).toBeInTheDocument()
    expect(screen.getByText(TEXTS.compare.costInSpainNote('15.000', '1,60', '1,50', '0,20'))).toBeInTheDocument()
  })

  it('shows a dash for a vehicle with no cost in Spain', async () => {
    mockFuelEconomyApi([camryDTO, { ...camryDTO, id: '1', model: 'Hydrogen', atvType: 'FCV' }])
    compare(['47085', '1'])

    render(<Compare />)

    await screen.findByText('Toyota Hydrogen')
    const costRow = screen.getByText(TEXTS.compare.annualCostInSpain).closest('tr')
    expect(within(costRow!).getByText('—')).toBeInTheDocument()
    expect(screen.queryByText(TEXTS.compare.cheapestInSpain('Toyota Camry', '2160 €'))).not.toBeInTheDocument()
  })

  it('does not name the cheapest with a single vehicle, but still explains the estimate', async () => {
    mockFuelEconomyApi([camryDTO])
    compare(['47085'])

    render(<Compare />)

    await screen.findByText('Toyota Camry')
    expect(screen.queryByText(TEXTS.compare.cheapestInSpain('Toyota Camry', '2160 €'))).not.toBeInTheDocument()
    expect(screen.getByText(TEXTS.compare.costInSpainNote('15.000', '1,60', '1,50', '0,20'))).toBeInTheDocument()
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
})
