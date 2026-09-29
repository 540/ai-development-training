import { fireEvent, screen } from '@testing-library/react'

import { bz4xDTO, camryDTO, priusPrimeDTO } from '@/test/fixtures'
import { mockFuelEconomyApi } from '@/test/utils/fuelEconomyApi'
import { render } from '@/test/utils/render'
import { TEXTS } from '@/ui/texts/texts'
import { Home } from '../Home'

// Combined liters: Camry 9.0, Prius Prime 4.5, bZ4X counts as 0
const CAMRY = 'Toyota Camry'
const PRIUS = 'Toyota Prius Prime SE'
const BZ4X = 'Toyota bZ4X Limited'

const [, , FUEL, COMPARISON] = [0, 1, 2, 3]

const choose = (select: number, value: string) =>
  fireEvent.change(screen.getAllByRole('combobox')[select], { target: { value } })

const typeLiters = (value: string) =>
  fireEvent.change(screen.getByPlaceholderText(TEXTS.search.value), { target: { value } })

const shown = () => [CAMRY, PRIUS, BZ4X].filter((name) => screen.queryByText(name))

const renderHome = async () => {
  mockFuelEconomyApi([camryDTO, priusPrimeDTO, bz4xDTO])
  render(<Home />)
  await screen.findByText(CAMRY)
}

describe('Home filters', () => {
  it('shows every vehicle while the liters box is empty', async () => {
    await renderHome()

    expect(shown()).toEqual([CAMRY, PRIUS, BZ4X])
  })

  it('keeps the vehicles above the liters', async () => {
    await renderHome()

    typeLiters('4,5')

    expect(shown()).toEqual([CAMRY])
  })

  it('keeps the vehicles with exactly the liters', async () => {
    await renderHome()

    choose(COMPARISON, 'equal')
    typeLiters('4.5')

    expect(shown()).toEqual([PRIUS])
  })

  it('keeps the vehicles below the liters, electric ones included', async () => {
    await renderHome()

    choose(COMPARISON, 'less')
    typeLiters('5')

    expect(shown()).toEqual([PRIUS, BZ4X])
  })

  it('keeps the vehicles above the liters when "less" is combined with a search', async () => {
    await renderHome()

    // Every vehicle matches "e" in its model or class, so only the liters filter decides
    fireEvent.change(screen.getByPlaceholderText(TEXTS.search.placeholder), { target: { value: 'e' } })
    choose(COMPARISON, 'less')
    typeLiters('5')

    expect(shown()).toEqual([CAMRY])
  })

  it('ignores a value that is not a number', async () => {
    await renderHome()

    typeLiters('abc')

    expect(shown()).toEqual([CAMRY, PRIUS, BZ4X])
  })

  it('keeps the vehicles of the chosen fuel', async () => {
    await renderHome()

    choose(FUEL, 'plugInHybrid')

    expect(shown()).toEqual([PRIUS])
  })
})
