import { FC } from 'react'
import { useParams } from 'react-router-dom'

import { headlineConsumption } from '@/core/Vehicle/domain/headlineConsumption'
import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import leafIcon from '@/ui/assets/leaf.svg'
import { CompareButton } from '@/ui/components/CompareButton'
import { FuelChip } from '@/ui/components/FuelChip'
import { Main } from '@/ui/components/Main'
import { VehicleCardSkeleton } from '@/ui/components/VehicleCardSkeleton'
import { COLORS, FUEL_COLORS } from '@/ui/styles/utils/colors'
import { driveLabel, fuelTypeLabel, transmissionLabel, vehicleClassLabel } from '@/ui/texts/labels'
import { TEXTS } from '@/ui/texts/texts'
import { EMPTY_VALUE, formatConsumption, formatNumber, formatUsd } from '@/ui/utils/format'

import { useVehicle } from './_hooks/useVehicle'
import classes from './Details.module.css'

const specRows = (vehicle: Vehicle): [string, string][] => {
  const headline = headlineConsumption(vehicle)
  const unit = headline ? ` ${TEXTS.units[headline.unit]}` : ''
  const rows: [string, string][] = [
    [TEXTS.details.vehicleClass, vehicleClassLabel(vehicle.vehicleClass)],
    [TEXTS.details.drive, driveLabel(vehicle.drive)],
    [TEXTS.details.transmission, transmissionLabel(vehicle.transmission)],
    [
      TEXTS.details.engine,
      vehicle.cylinders && vehicle.displacement
        ? TEXTS.details.engineDescription(String(vehicle.cylinders), formatConsumption(vehicle.displacement))
        : EMPTY_VALUE,
    ],
    [TEXTS.details.fuelType, fuelTypeLabel(vehicle.fuelType)],
    [TEXTS.details.cityConsumption, formatConsumption(headline?.consumption.city) + unit],
    [TEXTS.details.highwayConsumption, formatConsumption(headline?.consumption.highway) + unit],
    [TEXTS.details.combinedConsumption, formatConsumption(headline?.consumption.combined) + unit],
    [TEXTS.details.co2, `${formatNumber(vehicle.co2)} g/km`],
    [TEXTS.details.annualFuelCost, formatUsd(vehicle.annualFuelCostUsd)],
    [TEXTS.details.range, vehicle.range ? `${formatNumber(vehicle.range)} km` : EMPTY_VALUE],
  ]

  return [...rows, ...electricRows(vehicle)]
}

const electricRows = (vehicle: Vehicle): [string, string][] => {
  if (vehicle.fuel === 'electric') {
    return [[TEXTS.details.electricMotor, vehicle.electricMotor]]
  }
  if (vehicle.fuel !== 'plugInHybrid') {
    return []
  }
  return [
    [TEXTS.details.electricMotor, vehicle.electricMotor],
    [TEXTS.details.electricityConsumption, `${formatConsumption(vehicle.electricity?.combined)} kWh/100 km`],
    [TEXTS.details.electricRange, vehicle.electricRange ? `${formatNumber(vehicle.electricRange)} km` : EMPTY_VALUE],
    [TEXTS.details.utilityFactor, formatNumber(vehicle.utilityFactor)],
  ]
}

export const Details: FC = () => {
  const { id = '' } = useParams()
  const { vehicle, hasError } = useVehicle(id)

  if (hasError) {
    return (
      <Main>
        <h1>{TEXTS.details.error}</h1>
      </Main>
    )
  }

  if (!vehicle) {
    return (
      <Main>
        <VehicleCardSkeleton centered />
      </Main>
    )
  }

  const color = FUEL_COLORS[vehicle.fuel]
  const headline = headlineConsumption(vehicle)
  const savings = vehicle.fiveYearSavingsUsd
  const scores = [
    [vehicle.fuelEconomyScore, TEXTS.details.fuelEconomyScore],
    [vehicle.greenhouseGasScore, TEXTS.details.greenhouseGasScore],
  ] as const

  return (
    <Main>
      <div className={classes.sheet} style={{ ['--fuel-color' as string]: color }}>
        <div
          className={classes.header}
          style={{ background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color}, ${COLORS.black} 35%) 100%)` }}
        >
          <p className={classes.subtitle}>
            {vehicle.year} · {vehicle.make}
          </p>
          <h1 className={classes.title}>{vehicle.model}</h1>
          <div className={classes.chips}>
            <FuelChip fuel={vehicle.fuel} large background={COLORS.glass} />
            <span className={classes.classChip}>{vehicleClassLabel(vehicle.vehicleClass)}</span>
          </div>
          <div className={classes.headline}>
            {formatConsumption(headline?.consumption.combined)}
            {headline && (
              <span>
                {TEXTS.units[headline.unit]} {TEXTS.details.combined}
              </span>
            )}
          </div>
          <CompareButton vehicleId={vehicle.id} onColor />
        </div>
        <div className={classes.content}>
          <div className={classes.scores}>
            {scores.map(([score, title]) => (
              <div key={title} className={classes.score}>
                <div className={classes.scoreValue}>
                  <img src={leafIcon} alt="" />
                  <span>{score}/10</span>
                </div>
                <span className={classes.scoreTitle}>{title}</span>
              </div>
            ))}
          </div>
          <h2 className={classes.sectionTitle}>{TEXTS.details.specs}</h2>
          <table className={classes.specs}>
            <tbody>
              {specRows(vehicle).map(([title, value]) => (
                <tr key={title}>
                  <th>{title}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={classes.note}>
            {savings >= 0
              ? TEXTS.details.fiveYearSavings(formatNumber(savings))
              : TEXTS.details.fiveYearSpending(formatNumber(-savings))}
          </p>
        </div>
      </div>
    </Main>
  )
}
