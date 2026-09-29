import { FC } from 'react'
import { Outlet } from 'react-router-dom'

import { CompareProvider } from '@/ui/hooks/compare'

import { Header } from './_components/Header'
import classes from './Layout.module.css'

export const Layout: FC = () => (
  <CompareProvider>
    <div className={classes.container}>
      <Header />
      <Outlet />
    </div>
  </CompareProvider>
)
