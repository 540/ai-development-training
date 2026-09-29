const LOCALE = 'es-ES'

export const EMPTY_VALUE = '—'

/** A number the way it is written in Spain (decimal comma) */
export const formatNumber = (value: number): string => value.toLocaleString(LOCALE)

/** A consumption, always with one decimal (9,0 and not 9) */
export const formatConsumption = (value: number | null | undefined): string =>
  value === null || value === undefined
    ? EMPTY_VALUE
    : value.toLocaleString(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** An amount in US dollars, with the symbol after the figure */
export const formatUsd = (value: number): string => `${formatNumber(value)} $`
