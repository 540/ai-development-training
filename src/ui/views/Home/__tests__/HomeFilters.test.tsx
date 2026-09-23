import { fireEvent, screen } from '@testing-library/react'

import { render } from '@/test/utils'
import { fakePokeApi } from '@/test/pokeApi'

import { Home } from '../Home'

const fetchMock = vitest.fn(fakePokeApi)

const [GENERATION, STAT, COMPARISON] = [0, 1, 2]

const choose = (select: number, value: string) =>
  fireEvent.change(screen.getAllByRole('combobox')[select], { target: { value } })

const typeValue = (value: string) => fireEvent.change(screen.getByPlaceholderText('Value'), { target: { value } })

const renderHome = async () => {
  render(<Home />)
  await screen.findByText(/pikachu/i)
}

describe('Home filters', () => {
  beforeEach(() => {
    globalThis.fetch = fetchMock
    fetchMock.mockClear()
  })

  it('keeps the pokemons with a stat greater than the value', async () => {
    await renderHome()

    choose(STAT, 'speed')
    typeValue('80')

    expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    expect(screen.queryByText(/charmander/i)).not.toBeInTheDocument()
  })

  it('keeps the pokemons with a stat equal to the value', async () => {
    await renderHome()

    choose(COMPARISON, 'equal')
    typeValue('39')

    expect(screen.getByText(/charmander/i)).toBeInTheDocument()
    expect(screen.queryByText(/pikachu/i)).not.toBeInTheDocument()
  })

  it('keeps the pokemons with a stat less than the value', async () => {
    await renderHome()

    choose(COMPARISON, 'less')
    typeValue('36')

    expect(screen.getByText(/pikachu/i)).toBeInTheDocument()
    expect(screen.queryByText(/charmander/i)).not.toBeInTheDocument()
  })

  it('treats a value that is not a number as zero', async () => {
    await renderHome()

    typeValue('abc')

    expect(screen.getByPlaceholderText('Value')).toHaveValue('0')
    expect(screen.getByText(/charmander/i)).toBeInTheDocument()
  })

  it('says so when no pokemon matches', async () => {
    await renderHome()

    fireEvent.change(screen.getByPlaceholderText('Filter by name or type'), { target: { value: 'mewtwo' } })

    expect(screen.getByText('No Pokémons found')).toBeInTheDocument()
  })

  it('loads the pokemons of the chosen generation', async () => {
    await renderHome()

    choose(GENERATION, 'Johto')

    expect(fetchMock).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon?offset=151&limit=100')
  })
})
