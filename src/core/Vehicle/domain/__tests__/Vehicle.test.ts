import { VEHICLE_YEARS } from '../Vehicle'

describe('VEHICLE_YEARS', () => {
  it('goes from 2026 down to 1995, one per year', () => {
    expect(VEHICLE_YEARS).toHaveLength(32)
    expect(VEHICLE_YEARS[0]).toBe(2026)
    expect(VEHICLE_YEARS[VEHICLE_YEARS.length - 1]).toBe(1995)
    expect(VEHICLE_YEARS[1]).toBe(2025)
  })
})
