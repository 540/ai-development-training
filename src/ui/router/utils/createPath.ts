import { routes } from '../routes'

type Path = keyof typeof routes
type Params = Record<string, string>

export interface Route {
  path: Path
  params?: Params
}

export const createPath = ({ path, params }: Route): string => {
  let realPath = routes[path].path

  for (const key in params) {
    realPath = realPath.replace(`:${key}`, params[key])
  }

  return realPath
}
