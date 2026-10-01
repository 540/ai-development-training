import { formatConsumption, formatEur, formatNumber, formatPrice, formatUsd } from '../format'

describe('format', () => {
  it('writes decimals with a comma', () => {
    expect(formatNumber(0.71)).toBe('0,71')
  })

  it('writes a consumption with one decimal', () => {
    expect(formatConsumption(9)).toBe('9,0')
    expect(formatConsumption(13.84)).toBe('13,8')
  })

  it('writes a dash when there is no consumption', () => {
    expect(formatConsumption(null)).toBe('—')
  })

  it('writes dollars with the symbol after the figure', () => {
    expect(formatUsd(950)).toBe('950 $')
  })

  it('writes euros with the symbol after the figure', () => {
    expect(formatEur(2160)).toBe('2160 €')
  })

  it('writes a price with two decimals', () => {
    expect(formatPrice(1.6)).toBe('1,60')
  })
})
