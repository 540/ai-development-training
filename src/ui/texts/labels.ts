import { FuelKind } from '@/core/Vehicle/domain/Vehicle'

/** Spanish names of the values the API sends in English; a value missing here is shown as it comes */

export const FUEL_LABELS: Record<FuelKind, string> = {
  gasoline: 'Gasolina',
  diesel: 'Diésel',
  hybrid: 'Híbrido',
  plugInHybrid: 'Híbrido enchufable',
  electric: 'Eléctrico',
  flexFuel: 'Flexible (E85)',
  naturalGas: 'Gas natural (GNC)',
  bifuelNaturalGas: 'Bifuel (GNC)',
  bifuelLpg: 'Bifuel (GLP)',
  hydrogen: 'Hidrógeno',
}

// Order matters: Minicompact and Subcompact go before Compact
const VEHICLE_CLASSES: [string, string][] = [
  ['Two Seaters', 'Biplaza'],
  ['Minicompact Cars', 'Microcompacto'],
  ['Subcompact Cars', 'Utilitario'],
  ['Compact Cars', 'Compacto'],
  ['Midsize Cars', 'Berlina mediana'],
  ['Large Cars', 'Berlina grande'],
  ['Small Station Wagons', 'Familiar pequeño'],
  ['Midsize Station Wagons', 'Familiar mediano'],
  ['Small Sport Utility Vehicle', 'SUV pequeño'],
  ['Standard Sport Utility Vehicle', 'SUV grande'],
  ['Small Pickup Trucks', 'Pick-up pequeño'],
  ['Standard Pickup Trucks', 'Pick-up grande'],
  ['Minivan', 'Monovolumen'],
  ['Vans, Passenger Type', 'Furgoneta de pasajeros'],
  ['Vans, Cargo Type', 'Furgoneta de carga'],
  ['Special Purpose Vehicle', 'Vehículo especial'],
]

const DRIVES: Record<string, string> = {
  'Front-Wheel Drive': 'Delantera',
  'Rear-Wheel Drive': 'Trasera',
  'All-Wheel Drive': 'Total (AWD)',
  '4-Wheel Drive': '4x4',
  'Part-time 4-Wheel Drive': '4x4 conectable',
  '4-Wheel or All-Wheel Drive': '4x4 o total',
  '2-Wheel Drive': '4x2',
}

const FUEL_TYPES: Record<string, string> = {
  Regular: 'Gasolina normal',
  Midgrade: 'Gasolina intermedia',
  Premium: 'Gasolina premium',
  Diesel: 'Diésel',
  Electricity: 'Electricidad',
  'Regular Gas and Electricity': 'Gasolina normal y electricidad',
  'Premium and Electricity': 'Gasolina premium y electricidad',
  'Regular Gas or Electricity': 'Gasolina normal o electricidad',
  'Premium Gas or Electricity': 'Gasolina premium o electricidad',
  'Gasoline or E85': 'Gasolina o E85',
  'Premium or E85': 'Gasolina premium o E85',
  CNG: 'Gas natural (GNC)',
  Hydrogen: 'Hidrógeno',
}

export const vehicleClassLabel = (vehicleClass: string): string => {
  const match = VEHICLE_CLASSES.find(([english]) => vehicleClass.startsWith(english))
  const label = match ? match[1] + vehicleClass.slice(match[0].length) : vehicleClass
  return label.replace(' - ', ' ').replace('2WD', '4x2').replace('4WD', '4x4')
}

export const driveLabel = (drive: string): string => DRIVES[drive] ?? drive

export const fuelTypeLabel = (fuelType: string): string => FUEL_TYPES[fuelType] ?? fuelType

export const transmissionLabel = (transmission: string): string =>
  transmission
    .replace('Automatic', 'Automático')
    .replace('variable gear ratios', 'relación variable')
    .replace('-spd', ' vel.')

/** The version text comes as "Auto (S5), 6 cyl, 4.0 L, Turbo" */
export const trimLabel = (trim: string): string =>
  trim
    .replace('Auto (', 'Aut. (')
    .replace('Man ', 'Man. ')
    .replace(' cyl', ' cil.')
    .replace('Part-time AWD', 'AWD conectable')
    .replace(/(\d)\.(\d) L/, '$1,$2 L')
