import { FC } from 'react'
import { NavLink } from 'react-router-dom'

import carLogo from '@/ui/assets/car.svg'
import { useCompare } from '@/ui/hooks/compare'
import { paths } from '@/ui/router/paths'
import { TEXTS } from '@/ui/texts/texts'

import classes from './Header.module.css'

const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? classes.active : undefined)

export const Header: FC = () => {
  const { ids } = useCompare()

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <NavLink to={paths.home} className={classes.logo}>
          <img src={carLogo} alt="" />
          {TEXTS.appName}
        </NavLink>
        <nav>
          <ul className={classes.menu}>
            <li>
              <NavLink to={paths.home} end className={linkClass}>
                {TEXTS.nav.home}
              </NavLink>
            </li>
            <li>
              <NavLink to={paths.compare} className={linkClass}>
                {TEXTS.nav.compare(ids.length)}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
