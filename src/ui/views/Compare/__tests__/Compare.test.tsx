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

  it('removes a vehicle from the comparison', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    compare(['47085', '47219'])
    render(<Compare />)
    await screen.findByText('Toyota Camry')

    fireEvent.click(screen.getAllByText(TEXTS.compare.remove)[0])

    expect(await screen.findByText('Toyota bZ4X Limited')).toBeInTheDocument()
    expect(screen.queryByText('Toyota Camry')).not.toBeInTheDocument()
  })

  describe('energy cost in Spain', () => {
    const note = TEXTS.compare.energyCostNote('12.000', '1,60', '1,50', '0,20')
    const costRow = () => screen.getByText(TEXTS.compare.energyCost).closest('tr')!

    it('shows the yearly cost of each vehicle and says which one is cheapest', async () => {
      mockFuelEconomyApi([camryDTO, bz4xDTO])
      compare(['47085', '47219'])

      render(<Compare />)

      expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
      expect(within(costRow()).getByText('449')).toHaveClass(/best/)
      expect(within(costRow()).getByText('1728')).not.toHaveClass(/best/)
      expect(screen.getByText(TEXTS.compare.cheapest('Toyota bZ4X Limited', '449 €'))).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
    })

    it('does not name a cheapest vehicle when there is only one', async () => {
      mockFuelEconomyApi([camryDTO])
      compare(['47085'])

      render(<Compare />)

      expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
      expect(within(costRow()).getByText('1728')).toBeInTheDocument()
      expect(screen.getByText(note)).toBeInTheDocument()
      const cheapestPrefix = TEXTS.compare.cheapest('', '').split(':')[0]
      expect(screen.queryByText((content) => content.startsWith(cheapestPrefix))).not.toBeInTheDocument()
    })

    it('highlights every tied vehicle and names the first one', async () => {
      mockFuelEconomyApi([camryDTO, { ...camryDTO, id: '1', model: 'Camry LE' }])
      compare(['47085', '1'])

      render(<Compare />)

      expect(await screen.findByText('Toyota Camry LE')).toBeInTheDocument()
      within(costRow())
        .getAllByText('1728')
        .forEach((cell) => expect(cell).toHaveClass(/best/))
      expect(screen.getByText(TEXTS.compare.cheapest('Toyota Camry', '1728 €'))).toBeInTheDocument()
    })
  })
})
