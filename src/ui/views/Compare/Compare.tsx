import { FC, ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { Main } from '@/ui/components/Main'
import { VehicleCardSkeleton } from '@/ui/components/VehicleCardSkeleton'
import { useCompare } from '@/ui/hooks/compare'
import { detailsPath, paths } from '@/ui/router/paths'
import { FUEL_COLORS } from '@/ui/styles/utils/colors'
import { driveLabel, FUEL_LABELS, transmissionLabel, vehicleClassLabel } from '@/ui/texts/labels'
import { TEXTS } from '@/ui/texts/texts'
import { EMPTY_VALUE, formatConsumption, formatNumber } from '@/ui/utils/format'

import { useComparedVehicles } from './_hooks/useComparedVehicles'
import classes from './Compare.module.css'

interface Row {
  title: string
  value: (vehicle: Vehicle) => number | string | null
  /** Which end of the row is best; rows without it are not highlighted */
  best?: 'lowest' | 'highest'
  /** Show the number with one decimal */
  decimal?: boolean
}

const ROWS: Row[] = [
  { title: TEXTS.compare.fuel, value: (vehicle) => FUEL_LABELS[vehicle.fuel] },
  { title: TEXTS.compare.vehicleClass, value: (vehicle) => vehicleClassLabel(vehicle.vehicleClass) },
  { title: TEXTS.compare.drive, value: (vehicle) => driveLabel(vehicle.drive) },
  { title: TEXTS.compare.transmission, value: (vehicle) => transmissionLabel(vehicle.transmission) },
  { title: TEXTS.compare.cityLiters, value: (vehicle) => vehicle.liters?.city ?? null, best: 'lowest', decimal: true },
  {
    title: TEXTS.compare.highwayLiters,
    value: (vehicle) => vehicle.liters?.highway ?? null,
    best: 'lowest',
    decimal: true,
  },
  {
    title: TEXTS.compare.combinedLiters,
    value: (vehicle) => vehicle.liters?.combined ?? null,
    best: 'lowest',
    decimal: true,
  },
  {
    title: TEXTS.compare.electricity,
    value: (vehicle) => vehicle.electricity?.combined ?? null,
    best: 'lowest',
    decimal: true,
  },
  { title: TEXTS.compare.co2, value: (vehicle) => vehicle.co2, best: 'lowest' },
  { title: TEXTS.compare.annualFuelCost, value: (vehicle) => vehicle.annualFuelCostUsd, best: 'lowest' },
  { title: TEXTS.compare.range, value: (vehicle) => vehicle.range, best: 'highest' },
  { title: TEXTS.compare.fuelEconomyScore, value: (vehicle) => vehicle.fuelEconomyScore, best: 'highest' },
]

const bestValue = (row: Row, vehicles: Vehicle[]): number | null => {
  const numbers = vehicles.map(row.value).filter((value): value is number => typeof value === 'number')
  if (!row.best || vehicles.length < 2 || numbers.length === 0) {
    return null
  }
  return row.best === 'lowest' ? Math.min(...numbers) : Math.max(...numbers)
}

const formatCell = (row: Row, value: number | string | null): string => {
  if (value === null) {
    return EMPTY_VALUE
  }
  if (typeof value === 'string') {
    return value
  }
  return row.decimal ? formatConsumption(value) : formatNumber(value)
}

const Message: FC<{ children: ReactNode }> = ({ children }) => <Main>{children}</Main>

export const Compare: FC = () => {
  const { ids, toggle } = useCompare()
  const { vehicles, hasError } = useComparedVehicles(ids)

  if (hasError) {
    return (
      <Message>
        <h1>{TEXTS.compare.error}</h1>
      </Message>
    )
  }

  if (ids.length === 0) {
    return (
      <Message>
        <h2>{TEXTS.compare.empty}</h2>
        <p>
          {TEXTS.compare.pickBefore}
          <Link to={paths.home}>{TEXTS.compare.pickLink}</Link>.
        </p>
      </Message>
    )
  }

  if (!vehicles) {
    return (
      <Message>
        <VehicleCardSkeleton centered />
      </Message>
    )
  }

  return (
    <Main wide>
      <h1>{TEXTS.compare.title}</h1>
      <div className={classes.scroll}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th />
              {vehicles.map((vehicle) => (
                <th key={vehicle.id} className={classes.vehicle} style={{ borderTopColor: FUEL_COLORS[vehicle.fuel] }}>
                  <Link to={detailsPath(vehicle.id)}>
                    <span className={classes.year}>{vehicle.year}</span>
                    {vehicle.make} {vehicle.model}
                  </Link>
                  <button className={classes.remove} onClick={() => toggle(vehicle.id)}>
                    {TEXTS.compare.remove}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const best = bestValue(row, vehicles)
              return (
                <tr key={row.title}>
                  <th>{row.title}</th>
                  {vehicles.map((vehicle) => {
                    const value = row.value(vehicle)
                    return (
                      <td key={vehicle.id} className={best !== null && value === best ? classes.best : undefined}>
                        {formatCell(row, value)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Main>
  )
}
