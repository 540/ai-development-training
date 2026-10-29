import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import { accordDTO, bz4xDTO, camryDTO, civicNaturalGasDTO, priusPrimeDTO } from '@/test/fixtures'
import { mockFailingFuelEconomyApi, mockFuelEconomyApi } from '@/test/utils/fuelEconomyApi'
import { render } from '@/test/utils/render'
import { TEXTS } from '@/ui/texts/texts'
import { EMPTY_VALUE } from '@/ui/utils/format'
import { Compare } from '../Compare'
import { compareEnergyCostRow } from './__cases__/compareEnergyCost.cases'

const compare = (ids: string[]) => localStorage.setItem('comparedVehicles', JSON.stringify(ids))

const VEHICLES: Record<string, typeof camryDTO> = {
  camry: camryDTO,
  bz4x: bz4xDTO,
  priusPrime: priusPrimeDTO,
  accord: accordDTO,
  civicNaturalGas: civicNaturalGasDTO,
}

const CAMRY = '2024 Toyota Camry'
const BZ4X = '2024 Toyota bZ4X Limited'
const PRIUS_PRIME = '2024 Toyota Prius Prime SE'
const ACCORD = '2024 Honda Accord'

const ENERGY_COST_TITLE = TEXTS.compare.annualEnergyCost('12.000')
const ASSUMPTIONS = TEXTS.compare.energyAssumptions(
  '1,867',
  '1,834',
  '0,16',
  'septiembre de 2026',
  '12.000',
)

/** Renders the comparison of the named vehicles, in that order, once they are loaded */
const renderComparison = async (names: string[]) => {
  mockFuelEconomyApi(Object.values(VEHICLES))
  compare(names.map((name) => VEHICLES[name].id))
  render(<Compare />)
  const { make, model } = VEHICLES[names[0]]
  await screen.findByText(`${make} ${model}`)
}

describe('Compare', () => {
  it('asks to pick vehicles when there is nothing to compare', () => {
    render(<Compare />)

    expect(screen.getByText(TEXTS.compare.empty)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
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

  it.each(compareEnergyCostRow.cases)('$id: energy cost row of $vehicles', async (row) => {
    await renderComparison(row.vehicles.split(','))

    const cells = within(screen.getByText(ENERGY_COST_TITLE).closest('tr')!).queryAllByRole('cell')
    const expected = [
      { cost: row.cost0, best: row.best0 },
      { cost: row.cost1, best: row.best1 },
      { cost: row.cost2, best: row.best2 },
    ]
      .filter(({ cost }) => cost !== null)
      .map(({ cost, best }) => ({ text: cost === 'empty' ? EMPTY_VALUE : cost, best }))
    expect(cells.map((cell) => ({ text: cell.textContent, best: /best/.test(cell.className) }))).toEqual(expected)
  })

  it('no longer compares the yearly fuel cost in US dollars', async () => {
    await renderComparison(['camry', 'bz4x'])

    expect(screen.queryByText(TEXTS.details.annualFuelCost, { exact: false })).not.toBeInTheDocument()
  })

  it.each([
    { id: 301, vehicles: ['camry'], summary: null },
    { id: 302, vehicles: ['camry', 'bz4x'], summary: TEXTS.compare.cheapest(BZ4X, '1657', CAMRY) },
    { id: 303, vehicles: ['camry', 'bz4x', 'priusPrime'], summary: TEXTS.compare.cheapest(BZ4X, '1657', CAMRY) },
    {
      id: 304,
      vehicles: ['bz4x', 'priusPrime', 'civicNaturalGas'],
      summary: TEXTS.compare.cheapest(BZ4X, '154', PRIUS_PRIME),
    },
    { id: 305, vehicles: ['camry', 'accord'], summary: TEXTS.compare.cheapestTie([CAMRY, ACCORD]) },
    { id: 306, vehicles: ['accord', 'camry'], summary: TEXTS.compare.cheapestTie([ACCORD, CAMRY]) },
    { id: 307, vehicles: ['camry', 'civicNaturalGas'], summary: null },
    { id: 308, vehicles: ['bz4x', 'camry', 'accord'], summary: TEXTS.compare.cheapest(BZ4X, '1657', CAMRY) },
    { id: 309, vehicles: ['bz4x', 'accord', 'camry'], summary: TEXTS.compare.cheapest(BZ4X, '1657', ACCORD) },
    { id: 310, vehicles: ['priusPrime', 'camry'], summary: TEXTS.compare.cheapest(PRIUS_PRIME, '1503', CAMRY) },
  ])('$id: cheapest in Spain among $vehicles', async ({ vehicles, summary }) => {
    await renderComparison(vehicles)

    expect(screen.queryByRole('status')?.textContent ?? null).toBe(summary)
    expect(screen.queryByText(ASSUMPTIONS) !== null).toBe(summary !== null)
  })

  it('updates the cheapest in Spain as vehicles leave the comparison', async () => {
    await renderComparison(['camry', 'bz4x', 'priusPrime'])
    expect(screen.getByRole('status')).toHaveTextContent(TEXTS.compare.cheapest(BZ4X, '1657', CAMRY))

    fireEvent.click(screen.getAllByText(TEXTS.compare.remove)[1])

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(TEXTS.compare.cheapest(PRIUS_PRIME, '1503', CAMRY)),
    )

    fireEvent.click(screen.getAllByText(TEXTS.compare.remove)[1])

    await screen.findByText('Toyota Camry')
    expect(screen.queryByText('Toyota Prius Prime SE')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText(ASSUMPTIONS)).not.toBeInTheDocument()
  })

  it('updates the summary and the table as soon as a vehicle is removed, before the new data arrives', async () => {
    await renderComparison(['camry', 'bz4x', 'priusPrime'])
    globalThis.fetch = vitest.fn(() => new Promise<Response>(() => undefined))

    fireEvent.click(screen.getAllByText(TEXTS.compare.remove)[1])

    expect(screen.getByRole('status')).toHaveTextContent(TEXTS.compare.cheapest(PRIUS_PRIME, '1503', CAMRY))
    expect(screen.getByRole('status')).not.toHaveTextContent(BZ4X)
    expect(screen.queryByText('Toyota bZ4X Limited')).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByText(TEXTS.compare.remove)[1])

    expect(screen.queryByText('Toyota Prius Prime SE')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows no summary while the vehicles load', () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    compare(['47085', '47219'])

    render(<Compare />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.queryByText(ASSUMPTIONS)).not.toBeInTheDocument()
  })

  it('shows no summary when the comparison fails to load', async () => {
    mockFailingFuelEconomyApi()
    compare(['47085', '47219'])

    render(<Compare />)

    expect(await screen.findByText(TEXTS.compare.error)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
