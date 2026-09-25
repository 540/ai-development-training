import { fireEvent, screen, within } from '@testing-library/react'

import { render } from '@/test/utils'

import { TypeChart } from '../TypeChart'

const defender = (type: string) => screen.getByRole('button', { name: type })

const toggle = (...types: string[]) => {
  for (const type of types) fireEvent.click(defender(type))
}

const combined = (attacker: string) =>
  within(within(screen.getByRole('region', { name: 'Combined effectiveness' })).getByRole('listitem', { name: attacker }))

describe('the type chart', () => {
  beforeEach(() => {
    render(<TypeChart />)
  })

  it('shows every attacking type against every defending type', () => {
    expect(screen.getByRole('heading', { name: 'Type Chart' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Type effectiveness chart' })).toBeInTheDocument()
    expect(screen.getAllByRole('rowheader')).toHaveLength(18)
    expect(screen.getAllByRole('button')).toHaveLength(18)
    expect(screen.getAllByRole('cell')).toHaveLength(18 * 18)
  })

  it.each([
    ['fire vs grass: ×2', '×2'],
    ['water vs grass: ×0.5', '×0.5'],
    ['normal vs ghost: ×0', '×0'],
    ['dragon vs fairy: ×0', '×0'],
    ['ghost vs normal: ×0', '×0'],
    ['fire vs normal: ×1', ''],
  ])('labels the cell %s', (label, text) => {
    expect(screen.getByLabelText(label).textContent).toBe(text)
  })

  it('selects and deselects a defending type', () => {
    const fireVsGrass = () => screen.getByLabelText('fire vs grass: ×2').className

    expect(defender('grass')).toHaveAttribute('aria-pressed', 'false')
    expect(fireVsGrass()).not.toMatch(/selected/)

    toggle('grass')
    expect(defender('grass')).toHaveAttribute('aria-pressed', 'true')
    expect(fireVsGrass()).toMatch(/selected/)
    expect(defender('grass').closest('th')?.className).toMatch(/selected/)
    expect(screen.getByLabelText('fire vs water: ×2').className).not.toMatch(/selected/)

    toggle('grass')
    expect(defender('grass')).toHaveAttribute('aria-pressed', 'false')
    expect(fireVsGrass()).not.toMatch(/selected/)
  })

  it('allows at most two defending types', () => {
    toggle('grass')
    expect(defender('fire')).toBeEnabled()

    toggle('steel')
    expect(defender('grass')).toBeEnabled()
    expect(defender('steel')).toBeEnabled()
    expect(defender('fire')).toBeDisabled()
    expect(screen.getAllByRole('button').filter((button) => button.hasAttribute('disabled'))).toHaveLength(16)

    toggle('steel')
    expect(defender('fire')).toBeEnabled()
  })

  it('asks to select a defending type until there is one', () => {
    expect(
      screen.getByText('Select up to two defending types to see the combined effectiveness')
    ).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Combined effectiveness' })).not.toBeInTheDocument()

    toggle('grass')
    expect(screen.getByRole('heading', { name: 'Against grass' })).toBeInTheDocument()
    expect(combined('fire').getByText('×2')).toBeInTheDocument()
    expect(combined('normal').getByText('×1')).toBeInTheDocument()
    expect(within(screen.getByRole('region')).getAllByRole('listitem')).toHaveLength(18)

    toggle('steel')
    expect(screen.getByRole('heading', { name: 'Against grass / steel' })).toBeInTheDocument()
  })

  it.each([
    [['grass', 'steel'], 'fire', '×4'],
    [['grass', 'steel'], 'grass', '×0.25'],
    [['water', 'ground'], 'grass', '×4'],
    [['water', 'ground'], 'electric', '×0'],
    [['fire', 'water'], 'water', '×1'],
  ])('against %j, %s attacks are %s', (defenders, attacker, multiplier) => {
    toggle(...defenders)

    expect(combined(attacker).getByText(multiplier)).toBeInTheDocument()
  })
})
