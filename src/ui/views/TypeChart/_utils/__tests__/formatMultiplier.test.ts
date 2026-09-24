import { effectivenessClass, formatMultiplier } from '../formatMultiplier'

describe('the multiplier format', () => {
  it.each([
    [4, '×4'],
    [0.25, '×0.25'],
    [0, '×0'],
    [1, '×1'],
  ])('writes %s as %s', (value, expected) => {
    expect(formatMultiplier(value)).toBe(expected)
  })

  it.each([
    [4, 'superEffective'],
    [2, 'superEffective'],
    [0.5, 'notVeryEffective'],
    [0.25, 'notVeryEffective'],
    [0, 'noEffect'],
    [1, 'neutral'],
  ])('colors ×%s as %s', (value, expected) => {
    expect(effectivenessClass(value)).toBe(expected)
  })
})
