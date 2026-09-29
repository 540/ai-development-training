import { FC, ReactNode } from 'react'
import classes from './Main.module.css'

export const Main: FC<{ children: ReactNode; wide?: boolean }> = ({ children, wide = false }) => (
  <main className={wide ? `${classes.main} ${classes.wide}` : classes.main}>{children}</main>
)
