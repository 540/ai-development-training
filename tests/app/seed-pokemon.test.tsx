import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/composition-root'
import { POKE_API_BASE_URL } from '../../src/infrastructure/poke-api'
import { pokeApiServer } from '../support/poke-api-server'

describe('la ficha semilla', () => {
  it('muestra el nombre y el número de Pokédex del Pokémon 1', async () => {
    render(createApp())

    expect(await screen.findByTestId('pokemon-name')).toHaveTextContent('Bulbasaur')
    expect(screen.getByTestId('pokemon-number')).toHaveTextContent('#001')
  })

  it('avisa de que está cargando mientras llegan los datos', () => {
    render(createApp())

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('explica en lenguaje llano que la Pokédex no ha respondido', async () => {
    pokeApiServer.use(
      http.get(`${POKE_API_BASE_URL}/pokemon/:pokedexId`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    )

    render(createApp())

    expect(await screen.findByTestId('error')).toHaveTextContent(
      'No hemos podido traer la Pokédex',
    )
  })
})
