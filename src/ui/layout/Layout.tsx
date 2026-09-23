import { FC } from 'react'
import classes from './Layout.module.css'
import { Outlet } from 'react-router-dom'
import { Header } from './_components/Header/Header'
import { MainContainer } from './_components/MainContainer'

export const Layout: FC = () => {
  return (
    <div className={classes.container}>
      <Header />
      <MainContainer>
        <Outlet />
      </MainContainer>
    </div>
  )
}
