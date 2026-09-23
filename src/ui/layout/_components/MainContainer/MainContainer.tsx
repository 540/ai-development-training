import { FC, ReactNode } from 'react'

import classes from './MainContainer.module.css'

interface Props {
  children: ReactNode
}

export const MainContainer: FC<Props> = ({ children }) => (
  <div className={classes.container}>{children}</div>
)
