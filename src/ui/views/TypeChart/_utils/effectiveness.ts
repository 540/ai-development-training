import classes from './effectiveness.module.css'

type EffectivenessKind = 'noEffect' | 'superEffective' | 'notVeryEffective' | 'neutral'

const effectivenessKind = (value: number): EffectivenessKind => {
  if (value === 0) return 'noEffect'
  if (value > 1) return 'superEffective'
  if (value < 1) return 'notVeryEffective'

  return 'neutral'
}

export const formatMultiplier = (value: number): string => `×${value}`

export const effectivenessClass = (value: number): string => classes[effectivenessKind(value)]
