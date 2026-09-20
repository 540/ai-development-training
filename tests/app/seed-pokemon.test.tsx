import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '../../src/ui/App'

describe('la ficha semilla', () => {
  it('muestra el nombre y el número de Pokédex del Pokémon 1', async () => {
    render(<App />)

    expect(await screen.findByTestId('pokemon-name')).toHaveTextContent('Bulbasaur')
    expect(screen.getByTestId('pokemon-number')).toHaveTextContent('#001')
  })

  it('avisa de que está cargando mientras llegan los datos', () => {
    render(<App />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })
})
