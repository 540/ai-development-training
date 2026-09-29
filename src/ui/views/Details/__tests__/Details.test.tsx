import { screen } from '@testing-library/react'

import { priusPrimeDTO } from '@/test/fixtures'
import { mockFailingFuelEconomyApi, mockFuelEconomyApi } from '@/test/utils/fuelEconomyApi'
import { render } from '@/test/utils/render'
import { paths } from '@/ui/router/paths'
import { FUEL_LABELS, fuelTypeLabel } from '@/ui/texts/labels'
import { TEXTS } from '@/ui/texts/texts'
import { Details } from '../Details'

describe('Details', () => {
  it('shows the specs of the vehicle translated and in European units', async () => {
    mockFuelEconomyApi([priusPrimeDTO])

    render(<Details />, { route: '/vehicle/47501', path: paths.details })

    expect(await screen.findByText('Prius Prime SE')).toBeInTheDocument()
    expect(screen.getByText(FUEL_LABELS.plugInHybrid)).toBeInTheDocument()
    expect(screen.getByText(fuelTypeLabel('Regular Gas and Electricity'))).toBeInTheDocument()
    expect(screen.getByText('72 km')).toBeInTheDocument()
    expect(screen.getByText('16,2 kWh/100 km')).toBeInTheDocument()
  })

  it('shows an error message when loading the vehicle fails', async () => {
    mockFailingFuelEconomyApi()

    render(<Details />, { route: '/vehicle/1', path: paths.details })

    expect(await screen.findByText(TEXTS.details.error)).toBeInTheDocument()
  })
})
