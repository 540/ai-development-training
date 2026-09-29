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

const COMPARISONS: Record<ConsumptionFilter['comparison'], (liters: number, value: number) => boolean> = {
  greater: (liters, value) => liters > value,
  equal: (liters, value) => liters === value,
  less: (liters, value) => liters < value,
}

const matchesText = (vehicle: Vehicle, search: string): boolean => {
  const text = search.toLowerCase()

  return vehicle.model.toLowerCase().includes(text) || vehicleClassLabel(vehicle.vehicleClass).toLowerCase().includes(text)
}

const matchesFuel = (vehicle: Vehicle, fuel: FuelFilter): boolean => fuel === 'all' || vehicle.fuel === fuel

// With a search typed, "less" keeps the vehicles above the value: that is how the filter has always behaved
const matchesConsumption = (vehicle: Vehicle, filter: ConsumptionFilter, isSearching: boolean): boolean => {
  if (filter.value === null) {
    return true
  }
  const comparison = filter.comparison === 'less' && isSearching ? 'greater' : filter.comparison
  // Electric vehicles count as 0 liters
  return COMPARISONS[comparison](vehicle.liters?.combined ?? 0, filter.value)
}

const filterVehicles = (
  vehicles: Vehicle[] | undefined,
  search: string,
  fuel: FuelFilter,
  consumptionFilter: ConsumptionFilter
): Vehicle[] | undefined => {
  const isSearching = search.trim().length > 0

  return vehicles?.filter(
    (vehicle) =>
      (!isSearching || matchesText(vehicle, search)) &&
      matchesFuel(vehicle, fuel) &&
      matchesConsumption(vehicle, consumptionFilter, isSearching)
  )
}
