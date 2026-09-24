import { Details } from '../views/Details'
import { Home } from '../views/Home'
import { TypeChart } from '../views/TypeChart'
import { paths } from './paths'

export const routes = {
  home: {
    path: paths.home,
    element: Home,
  },
  types: {
    path: paths.types,
    element: TypeChart,
  },
  details: {
    path: paths.details,
    element: Details,
  },
}
