export type EffectivenessClass =
  | 'superEffective'
  | 'notVeryEffective'
  | 'noEffect'
  | 'neutral'

export const formatMultiplier = (value: number): string => `×${value}`

export const effectivenessClass = (value: number): EffectivenessClass => {
  if (value === 0) return 'noEffect'
  if (value > 1) return 'superEffective'
  if (value < 1) return 'notVeryEffective'
  return 'neutral'
}
