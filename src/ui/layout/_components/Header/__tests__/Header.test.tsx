import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { render } from '@/test/utils'
import { paths } from '@/ui/router/paths'
import { TypeChart } from '@/ui/views/TypeChart'

import { Header } from '../Header'

describe('the header', () => {
  it('navigates to the type chart and highlights its link', async () => {
    render(
      <>
        <Header />
        <Routes>
          <Route path={paths.home} element={<p>home page</p>} />
          <Route path={paths.types} element={<TypeChart />} />
        </Routes>
      </>
    )

    const homeLink = screen.getByRole('link', { name: 'Home' })
    const typesLink = screen.getByRole('link', { name: 'Types' })
    expect(screen.getByText('home page')).toBeInTheDocument()

    fireEvent.click(typesLink)

    expect(
      await screen.findByRole('heading', { name: 'Type Chart' })
    ).toBeInTheDocument()
    expect(typesLink.className).toMatch(/isActive/)
    expect(homeLink.className).not.toMatch(/isActive/)
  })
})
