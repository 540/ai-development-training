import { FC } from 'react'

import { FuelKind } from '@/core/Vehicle/domain/Vehicle'
import boltIcon from '@/ui/assets/bolt.svg'
import fuelIcon from '@/ui/assets/fuel.svg'
import { FUEL_COLORS } from '@/ui/styles/utils/colors'
import { FUEL_LABELS } from '@/ui/texts/labels'

import classes from './FuelChip.module.css'

interface Props {
  fuel: FuelKind
  large?: boolean
  /** Background of the chip; the fuel color when not given */
  background?: string
}

export const FuelChip: FC<Props> = ({ fuel, large = false, background = FUEL_COLORS[fuel] }) => (
  <span className={large ? `${classes.chip} ${classes.large}` : classes.chip} style={{ backgroundColor: background }}>
    <img className={classes.icon} src={fuel === 'electric' ? boltIcon : fuelIcon} alt="" />
    {FUEL_LABELS[fuel]}
  </span>
)
