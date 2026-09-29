import { FuelKind } from '@/core/Vehicle/domain/Vehicle'

const createCSSVariable = (color: string) => `var(--color-${color})`

export const COLORS = {
  primary: createCSSVariable('primary'),
  white: createCSSVariable('white'),
  black: createCSSVariable('black'),
  glass: createCSSVariable('glass'),
}

export const FUEL_COLORS: Record<FuelKind, string> = {
  gasoline: createCSSVariable('gasoline'),
  diesel: createCSSVariable('diesel'),
  hybrid: createCSSVariable('hybrid'),
  plugInHybrid: createCSSVariable('plug-in-hybrid'),
  electric: createCSSVariable('electric'),
  flexFuel: createCSSVariable('flex-fuel'),
  naturalGas: createCSSVariable('natural-gas'),
  bifuelNaturalGas: createCSSVariable('natural-gas'),
  bifuelLpg: createCSSVariable('lpg'),
  hydrogen: createCSSVariable('hydrogen'),
}
