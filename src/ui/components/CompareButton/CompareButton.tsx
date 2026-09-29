import { FC } from 'react'

import { useCompare } from '@/ui/hooks/compare'
import { TEXTS } from '@/ui/texts/texts'

import classes from './CompareButton.module.css'

interface Props {
  vehicleId: string
  /** Button over a colored background, with the long text */
  onColor?: boolean
}

export const CompareButton: FC<Props> = ({ vehicleId, onColor = false }) => {
  const { isCompared, isFull, toggle } = useCompare()
  const compared = isCompared(vehicleId)
  const className = [classes.button, compared && classes.active, onColor && classes.onColor].filter(Boolean).join(' ')
  const addText = onColor ? TEXTS.compareButton.addLong : TEXTS.compareButton.add

  return (
    <button className={className} disabled={!compared && isFull} onClick={() => toggle(vehicleId)}>
      {compared ? TEXTS.compareButton.added : addText}
    </button>
  )
}
