import { render, screen } from '@testing-library/react'

import { fakePokeApi } from '@/test/pokeApi'

const renderAppAt = async (path: string) => {
  window.history.pushState({}, '', path)
  vitest.resetModules()
  await import('@/di')
  const { Router } = await import('../Router')
  render(<Router />)
}

describe('the app', () => {
  beforeEach(() => {
    globalThis.fetch = vitest.fn(fakePokeApi)
  })

  it('opens on the list of pokemons with the header', async () => {
    await renderAppAt('/')

    expect(screen.getByText('Pokédex')).toBeInTheDocument()
    expect(await screen.findByText(/pikachu/i)).toBeInTheDocument()
  })

  it('opens the card of a pokemon from its own address', async () => {
    await renderAppAt('/25')

    expect(await screen.findByText('Base Stats')).toBeInTheDocument()
    expect(screen.getByText('025', { exact: false })).toBeInTheDocument()
  })

  it('opens the type chart from its own address', async () => {
    await renderAppAt('/types')

    expect(await screen.findByRole('heading', { name: 'Type Chart' })).toBeInTheDocument()
    expect(screen.queryByText('Base Stats')).not.toBeInTheDocument()
  })
})
