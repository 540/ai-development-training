import { FC, ReactNode } from 'react'

import pokeball from '@/ui/assets/pokeball.svg'

import classes from './Header.module.css'
import { Link } from '@/ui/components/Link'
import { MainContainer } from '../MainContainer'
import { Route } from '@/ui/router/utils'

export const Header: FC = () => (
  <header className={classes.container}>
    <MainContainer>
      <div className={classes.wrapper}>
        <Link
          route={{
            path: 'home',
          }}
        >
          <div className={classes.titleContainer}>
            <img src={pokeball} alt="main-logo" />
            Pokédex
          </div>
        </Link>
        <ul className={classes.itemList}>
          <Item path="home">Home</Item>
          <Item path="types">Types</Item>
        </ul>
      </div>
    </MainContainer>
  </header>
)

interface HeaderLinkProps {
  path: Route['path']
  children: ReactNode
}

const Item: FC<HeaderLinkProps> = ({ path, children }) => (
  <li>
    <Link
      route={{
        path,
      }}
      highlightWhenActive={true}
    >
      {children}
    </Link>
  </li>
)
