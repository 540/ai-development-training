import { paths } from '../paths'

type Path = keyof typeof paths
type Params = Record<string, string>

export interface Route {
  path: Path
  params?: Params
}

export const createPath = ({ path, params }: Route): string => {
  let realPath = paths[path]

  for (const key in params) {
    realPath = realPath.replace(`:${key}`, params[key])
  }

  return realPath
}
