import { FC } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from '../layout'
import { routes } from './routes'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: Object.values(routes).map(({ element: Element, path }) => ({
      path,
      element: <Element />,
    })),
  },
])

export const Router: FC = () => {
  return <RouterProvider router={router} />
}
