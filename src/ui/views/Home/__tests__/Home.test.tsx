import { fireEvent, screen, waitFor } from '@testing-library/react'

import { bz4xDTO, camryDTO } from '@/test/fixtures'
import { mockFailingFuelEconomyApi, mockFuelEconomyApi } from '@/test/utils/fuelEconomyApi'
import { render } from '@/test/utils/render'
import { TEXTS } from '@/ui/texts/texts'
import { Home } from '../Home'

describe('Home', () => {
  it('shows the vehicles of the year and make, with their consumption in European units', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])

    render(<Home />)

    expect(await screen.findByText('Toyota Camry')).toBeInTheDocument()
    expect(screen.getByText('Toyota bZ4X Limited')).toBeInTheDocument()
    expect(screen.getByText('9,0')).toBeInTheDocument()
    expect(screen.getByText('18,7')).toBeInTheDocument()
  })

  it('shows skeleton cards while the API answers', () => {
    mockFuelEconomyApi([camryDTO])

    render(<Home />)

    expect(screen.getAllByTestId('vehicleCardSkeleton')).not.toHaveLength(0)
  })

  it('shows an error message when loading the vehicles fails', async () => {
    mockFailingFuelEconomyApi()

    render(<Home />)

    expect(await screen.findByText(TEXTS.home.error)).toBeInTheDocument()
  })

  it('filters the vehicles by model', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    render(<Home />)
    await screen.findByText('Toyota Camry')

    fireEvent.change(screen.getByPlaceholderText(TEXTS.search.placeholder), { target: { value: 'bz4x' } })

    await waitFor(() => expect(screen.queryByText('Toyota Camry')).not.toBeInTheDocument())
    expect(screen.getByText('Toyota bZ4X Limited')).toBeInTheDocument()
  })

  it('filters the vehicles by combined liters, counting electric vehicles as zero', async () => {
    mockFuelEconomyApi([camryDTO, bz4xDTO])
    render(<Home />)
    await screen.findByText('Toyota Camry')

    fireEvent.change(screen.getByPlaceholderText(TEXTS.search.value), { target: { value: '5' } })

    await waitFor(() => expect(screen.queryByText('Toyota bZ4X Limited')).not.toBeInTheDocument())
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument()
  })

  it('adds a vehicle to the comparison', async () => {
    mockFuelEconomyApi([camryDTO])
    render(<Home />)
    await screen.findByText('Toyota Camry')

    fireEvent.click(screen.getByText(TEXTS.compareButton.add))

    expect(screen.getByText(TEXTS.compareButton.added)).toBeInTheDocument()
    expect(screen.getByText(TEXTS.home.compareBar(1, 3))).toBeInTheDocument()
  })
})
