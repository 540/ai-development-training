import { render as tlrRender } from '@testing-library/react'
import { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { CompareProvider } from '@/ui/hooks/compare'

interface Options {
  /** URL the view is rendered at */
  route?: string
  /** Route pattern the view is mounted on, to read its params */
  path?: string
}

export const render = (component: ReactNode, { route = '/', path = '*' }: Options = {}) => {
  tlrRender(
    <MemoryRouter initialEntries={[route]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <CompareProvider>
        <Routes>
          <Route path={path} element={component} />
        </Routes>
      </CompareProvider>
    </MemoryRouter>
  )
}
