import { FC, ReactNode } from 'react'
import styles from './Main.module.css'

interface Props {
  children: ReactNode
}

export const Main: FC<Props> = ({ children }) => {
  return <main className={styles.container}>{children}</main>
}
