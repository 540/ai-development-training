import { fireEvent, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { fakePokeApi } from '@/test/pokeApi'
import { render } from '@/test/utils'
import { routes } from '@/ui/router/routes'

import { Header } from '../Header'

describe('the header', () => {
  beforeEach(() => {
    globalThis.fetch = vitest.fn(fakePokeApi)
  })

  it('navigates to the type chart and highlights its link', async () => {
    render(
      <>
        <Header />
        <Routes>
          {Object.values(routes).map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Routes>
      </>
    )
    await screen.findByText(/pikachu/i)
    expect(screen.getByRole('link', { name: 'Types' })).not.toHaveAttribute('aria-current')

    fireEvent.click(screen.getByRole('link', { name: 'Types' }))

    expect(await screen.findByRole('heading', { name: 'Type Chart' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Types' })).toHaveAttribute('aria-current', 'page')
  })
})
