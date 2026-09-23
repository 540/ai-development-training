import { Details } from '../views/Details'
import { Home } from '../views/Home'

export const routes = {
  home: {
    path: '/',
    element: Home,
  },
  details: {
    path: '/:id',
    element: Details,
  },
}
