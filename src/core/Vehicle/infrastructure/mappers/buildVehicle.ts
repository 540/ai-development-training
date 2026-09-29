import { Consumption, FuelKind, Vehicle } from '@/core/Vehicle/domain/Vehicle'
import {
  gramsPerMileToGramsPerKilometer,
  kwhPer100Km,
  litersPer100Km,
  milesToKilometers,
} from '@/core/Vehicle/domain/units'

import { MenuDTO, MenuItemDTO, VehicleDTO } from '../dto/Vehicle.dto'

const FUEL_KINDS_BY_ATV_TYPE: Record<string, FuelKind> = {
  Diesel: 'diesel',
  Hybrid: 'hybrid',
  'Plug-in Hybrid': 'plugInHybrid',
  EV: 'electric',
  FFV: 'flexFuel',
  CNG: 'naturalGas',
  'Bifuel (CNG)': 'bifuelNaturalGas',
  'Bifuel (LPG)': 'bifuelLpg',
  FCV: 'hydrogen',
}

/** The entries of a menu, whatever shape the API sent it in */
export const toMenuItems = (menu: MenuDTO): MenuItemDTO[] => {
  if (!menu) {
    return []
  }
  return Array.isArray(menu.menuItem) ? menu.menuItem : [menu.menuItem]
}

const toNumber = (value: string): number => {
  const number = Number.parseFloat(value)
  return Number.isNaN(number) ? 0 : number
}

const toNullableNumber = (value: string): number | null => {
  const number = toNumber(value)
  return number > 0 ? number : null
}

const buildConsumption = (
  city: string,
  highway: string,
  combined: string,
  convert: (value: number) => number | null
): Consumption | null => {
  const combinedValue = convert(toNumber(combined))
  if (combinedValue === null) {
    return null
  }
  return {
    city: convert(toNumber(city)) ?? combinedValue,
    highway: convert(toNumber(highway)) ?? combinedValue,
    combined: combinedValue,
  }
}

export const buildVehicle = (vehicleDTO: VehicleDTO, trim?: string): Vehicle => {
  const fuel = FUEL_KINDS_BY_ATV_TYPE[vehicleDTO.atvType ?? ''] ?? 'gasoline'
  const isElectric = fuel === 'electric' || fuel === 'hydrogen'

  return {
    id: vehicleDTO.id,
    year: toNumber(vehicleDTO.year),
    make: vehicleDTO.make,
    model: vehicleDTO.model,
    trim,
    fuel,
    fuelType: vehicleDTO.fuelType,
    vehicleClass: vehicleDTO.VClass,
    drive: vehicleDTO.drive,
    transmission: vehicleDTO.trany,
    cylinders: toNullableNumber(vehicleDTO.cylinders),
    displacement: toNullableNumber(vehicleDTO.displ),
    electricMotor: vehicleDTO.evMotor,
    // For electric vehicles city08/highway08/comb08 are MPGe, not a fuel consumption
    liters: isElectric
      ? null
      : buildConsumption(vehicleDTO.city08, vehicleDTO.highway08, vehicleDTO.comb08, litersPer100Km),
    electricity: buildConsumption(vehicleDTO.cityE, vehicleDTO.highwayE, vehicleDTO.combE, kwhPer100Km),
    co2: gramsPerMileToGramsPerKilometer(toNumber(vehicleDTO.co2TailpipeGpm)),
    annualFuelCostUsd: toNumber(vehicleDTO.fuelCost08),
    range: milesToKilometers(toNumber(vehicleDTO.range)),
    electricRange: milesToKilometers(toNumber(vehicleDTO.rangeA)),
    utilityFactor: toNumber(vehicleDTO.combinedUF),
    fuelEconomyScore: toNumber(vehicleDTO.feScore),
    greenhouseGasScore: toNumber(vehicleDTO.ghgScore),
    fiveYearSavingsUsd: toNumber(vehicleDTO.youSaveSpend),
  }
}
