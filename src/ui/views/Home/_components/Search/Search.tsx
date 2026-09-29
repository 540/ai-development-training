import { FC } from 'react'

import { FUEL_KINDS, FuelKind, VEHICLE_MAKES, VEHICLE_YEARS } from '@/core/Vehicle/domain/Vehicle'
import { FUEL_LABELS } from '@/ui/texts/labels'
import { TEXTS } from '@/ui/texts/texts'

import classes from './Search.module.css'

export type Comparison = 'greater' | 'equal' | 'less'

export interface ConsumptionFilter {
  comparison: Comparison
  /** Liters per 100 km; null while the box is empty, which means no filter */
  value: number | null
}

export type FuelFilter = FuelKind | 'all'

interface Props {
  year: number
  make: string
  search: string
  fuel: FuelFilter
  consumptionFilter: ConsumptionFilter
  onYearChange: (year: number) => void
  onMakeChange: (make: string) => void
  onSearchChange: (search: string) => void
  onFuelChange: (fuel: FuelFilter) => void
  onConsumptionFilterChange: (filter: ConsumptionFilter) => void
}

const isFuelFilter = (value: string): value is FuelFilter => value === 'all' || FUEL_KINDS.some((fuel) => fuel === value)

const isComparison = (value: string): value is Comparison => ['greater', 'equal', 'less'].includes(value)

export const Search: FC<Props> = ({
  year,
  make,
  search,
  fuel,
  consumptionFilter,
  onYearChange,
  onMakeChange,
  onSearchChange,
  onFuelChange,
  onConsumptionFilterChange,
}) => (
  <div className={classes.search}>
    <div className={classes.row}>
      <select className={classes.select} value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
        {VEHICLE_YEARS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select
        className={`${classes.select} ${classes.make}`}
        value={make}
        onChange={(event) => onMakeChange(event.target.value)}
      >
        {VEHICLE_MAKES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
    <input
      className={classes.input}
      value={search}
      placeholder={TEXTS.search.placeholder}
      onChange={(event) => onSearchChange(event.target.value)}
    />
    <div className={classes.row}>
      <select
        className={classes.select}
        value={fuel}
        onChange={(event) => isFuelFilter(event.target.value) && onFuelChange(event.target.value)}
      >
        <option value="all">{TEXTS.search.allFuels}</option>
        {FUEL_KINDS.map((option) => (
          <option key={option} value={option}>
            {FUEL_LABELS[option]}
          </option>
        ))}
      </select>
      <span className={classes.label}>{TEXTS.search.consumption}</span>
      <select
        className={classes.select}
        value={consumptionFilter.comparison}
        onChange={(event) =>
          isComparison(event.target.value) &&
          onConsumptionFilterChange({ ...consumptionFilter, comparison: event.target.value })
        }
      >
        <option value="greater">{TEXTS.search.greater}</option>
        <option value="equal">{TEXTS.search.equal}</option>
        <option value="less">{TEXTS.search.less}</option>
      </select>
      <input
        className={`${classes.input} ${classes.value}`}
        type="text"
        value={consumptionFilter.value ?? ''}
        placeholder={TEXTS.search.value}
        onChange={(event) => {
          const text = event.target.value.trim()
          const value = Number(text.replace(',', '.'))
          onConsumptionFilterChange({ ...consumptionFilter, value: text === '' || Number.isNaN(value) ? null : value })
        }}
      />
    </div>
  </div>
)
