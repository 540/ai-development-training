import { Details } from '../views/Details'
import { Home } from '../views/Home'
import { paths } from './paths'

export const routes = {
  home: {
    path: paths.home,
    element: Home,
  },
  details: {
    path: paths.details,
    element: Details,
  },
}
