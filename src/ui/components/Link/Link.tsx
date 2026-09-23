import { FC, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

import classes from './Link.module.css'
import { Route, createPath } from '@/ui/router/utils'

interface Props {
  route: Route
  children: ReactNode
  highlightWhenActive?: boolean
}

export const Link: FC<Props> = ({
  route,
  children,
  highlightWhenActive = false,
}) => {
  const to = createPath(route)

  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        return highlightWhenActive && isActive ? classes.isActive : ''
      }}
    >
      {children}
    </NavLink>
  )
}
