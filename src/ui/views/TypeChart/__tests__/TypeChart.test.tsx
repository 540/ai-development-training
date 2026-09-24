import { fireEvent, screen, within } from '@testing-library/react'

import { POKEMON_TYPES } from '@/core/Pokemon/domain/PokemonType'
import { render } from '@/test/utils'

import { TypeChart } from '../TypeChart'

const pressDefender = (type: string) => {
  fireEvent.click(screen.getByRole('button', { name: type }))
}

const summaryMultiplier = (section: string, attacker: string) => {
  const summary = screen.getByRole('region', { name: section })
  return within(summary).getByRole('listitem', { name: attacker })
}

describe('the type chart', () => {
  it('shows every attacking type against every defending type', () => {
    render(<TypeChart />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Type Chart' })
    ).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()

    const rowHeaders = screen.getAllByRole('rowheader')
    expect(rowHeaders.map((header) => header.textContent)).toEqual([
      ...POKEMON_TYPES,
    ])
    const defenderButtons = screen.getAllByRole('button')
    expect(
      defenderButtons.map((button) => button.getAttribute('aria-label'))
    ).toEqual([...POKEMON_TYPES])
  })

  it.each([
    ['fire vs grass: ×2', '×2'],
    ['water vs grass: ×0.5', '×0.5'],
    ['normal vs ghost: ×0', '×0'],
    ['dragon vs fairy: ×0', '×0'],
    ['ghost vs normal: ×0', '×0'],
    ['fire vs normal: ×1', ''],
  ])('labels the cell %s', (label, text) => {
    render(<TypeChart />)

    const cell = screen.getByLabelText(label)
    expect(cell.textContent).toBe(text)
  })

  it('gives each effectiveness level its own cell class', () => {
    render(<TypeChart />)

    const cls = (label: string) => screen.getByLabelText(label).className
    const superEffective = cls('fire vs grass: ×2')
    const notVeryEffective = cls('water vs grass: ×0.5')
    const noEffect = cls('normal vs ghost: ×0')
    const neutral = cls('fire vs normal: ×1')
    expect(
      new Set([superEffective, notVeryEffective, noEffect, neutral]).size
    ).toBe(4)
    expect(cls('dragon vs fairy: ×0')).toBe(noEffect)
  })

  it('keeps the effectiveness color of the cells in a selected column', () => {
    render(<TypeChart />)

    pressDefender('grass')

    const superEffective = screen.getByLabelText('fire vs grass: ×2')
    expect(superEffective.className).toMatch(/superEffective/)
    expect(superEffective.className).not.toMatch(/selectedNeutral/)
    const neutral = screen.getByLabelText('normal vs grass: ×1')
    expect(neutral.className).toMatch(/selectedNeutral/)
    const unselected = screen.getByLabelText('fire vs normal: ×1')
    expect(unselected.className).not.toMatch(/selectedNeutral/)
  })

  it('selects and deselects a defending type', () => {
    render(<TypeChart />)

    const grass = screen.getByRole('button', { name: 'grass' })
    expect(grass).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(grass)
    expect(grass).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(grass)
    expect(grass).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByText(
        'Select up to two defending types to see the combined effectiveness'
      )
    ).toBeInTheDocument()
  })

  it('allows two defending types at most', () => {
    render(<TypeChart />)

    pressDefender('grass')
    pressDefender('steel')

    expect(screen.getByRole('button', { name: 'grass' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'steel' })).toBeEnabled()
    const others = POKEMON_TYPES.filter(
      (type) => type !== 'grass' && type !== 'steel'
    )
    others.forEach((type) => {
      expect(screen.getByRole('button', { name: type })).toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'fire' }))
    expect(screen.getByRole('button', { name: 'fire' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    pressDefender('steel')
    expect(screen.getByRole('button', { name: 'fire' })).toBeEnabled()
  })

  it('asks to select a type when none is selected', () => {
    render(<TypeChart />)

    expect(
      screen.getByText(
        'Select up to two defending types to see the combined effectiveness'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('region')).not.toBeInTheDocument()
  })

  it('shows every attacker against a single defending type', () => {
    render(<TypeChart />)

    pressDefender('grass')

    expect(
      screen.getByRole('heading', { level: 2, name: 'Against grass' })
    ).toBeInTheDocument()
    const summary = screen.getByRole('region', { name: 'Against grass' })
    expect(within(summary).getAllByRole('listitem')).toHaveLength(18)
    expect(summaryMultiplier('Against grass', 'fire')).toHaveTextContent('×2')
    expect(summaryMultiplier('Against grass', 'water')).toHaveTextContent(
      '×0.5'
    )
  })

  it.each([
    ['grass', 'steel', 'fire', '×4'],
    ['grass', 'steel', 'grass', '×0.25'],
    ['water', 'ground', 'grass', '×4'],
    ['water', 'ground', 'electric', '×0'],
    ['fire', 'water', 'water', '×1'],
  ])(
    'combines %s and %s: %s is %s',
    (first, second, attacker, expected) => {
      render(<TypeChart />)

      pressDefender(first)
      pressDefender(second)

      const section = `Against ${first} / ${second}`
      expect(
        screen.getByRole('heading', { level: 2, name: section })
      ).toBeInTheDocument()
      const item = summaryMultiplier(section, attacker)
      expect(within(item).getByText(expected)).toBeInTheDocument()
    }
  )
})
