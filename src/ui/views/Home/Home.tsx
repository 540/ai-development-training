import { FC, useState } from 'react'
import { Link } from 'react-router-dom'

import { MAX_COMPARED_VEHICLES, Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { Main } from '@/ui/components/Main'
import { useCompare } from '@/ui/hooks/compare'
import { paths } from '@/ui/router/paths'
import { vehicleClassLabel } from '@/ui/texts/labels'
import { TEXTS } from '@/ui/texts/texts'

import { ConsumptionFilter, FuelFilter, Search } from './_components/Search'
import { VehicleList } from './_components/VehicleList'
import { useVehicles } from './_hooks/useVehicles'
import classes from './Home.module.css'

export const Home: FC = () => {
  const [year, setYear] = useState(2024)
  const [make, setMake] = useState('Toyota')
  const [search, setSearch] = useState('')
  const [fuel, setFuel] = useState<FuelFilter>('all')
  const [consumptionFilter, setConsumptionFilter] = useState<ConsumptionFilter>({ comparison: 'greater', value: null })

  const { vehicles, hasError } = useVehicles(year, make)
  const { ids } = useCompare()

  if (hasError) {
    return (
      <Main>
        <h1>{TEXTS.home.error}</h1>
      </Main>
    )
  }

  return (
    <Main>
      <Search
        year={year}
        make={make}
        search={search}
        fuel={fuel}
        consumptionFilter={consumptionFilter}
        onYearChange={setYear}
        onMakeChange={setMake}
        onSearchChange={setSearch}
        onFuelChange={setFuel}
        onConsumptionFilterChange={setConsumptionFilter}
      />
      {ids.length > 0 && (
        <Link to={paths.compare} className={classes.compareBar}>
          {TEXTS.home.compareBar(ids.length, MAX_COMPARED_VEHICLES)}
        </Link>
      )}
      <VehicleList vehicles={filterVehicles(vehicles, search, fuel, consumptionFilter)} />
    </Main>
  )
}

const filterVehicles = (
  vehicles: Vehicle[] | undefined,
  search: string,
  fuel: FuelFilter,
  consumptionFilter: ConsumptionFilter
): Vehicle[] | undefined => {
  if (!vehicles) {
    return vehicles
  }

  return vehicles.filter((vehicle) => {
    const s = search.toLowerCase()
    let result = true
    // Electric vehicles count as 0 liters
    const liters = vehicle.liters?.combined ?? 0
    let textOk = search.trim().length === 0
    const val = consumptionFilter.value
    let consumptionOk = true
    const comp = consumptionFilter.comparison

    if (!textOk) {
      textOk =
        vehicle.model.toLowerCase().includes(s) || vehicleClassLabel(vehicle.vehicleClass).toLowerCase().includes(s)
    }

    if (fuel !== 'all' && vehicle.fuel !== fuel) {
      result = false
    }

    if (val === null) {
      consumptionOk = true
    } else if (comp === 'greater') {
      consumptionOk = liters > val
    } else if (comp === 'equal') {
      consumptionOk = liters === val
    } else if (comp === 'less') {
      if (textOk && search.trim().length > 0) {
        consumptionOk = liters > val
      } else {
        consumptionOk = liters < val
      }
    }

    if (!textOk) {
      result = false
    }
    if (!consumptionOk) {
      result = false
    }

    return result
  })
}
