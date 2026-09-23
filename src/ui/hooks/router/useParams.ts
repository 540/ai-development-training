import { useParams as useParamsRRD } from 'react-router-dom'

export const useParams = <T extends Record<string, string | undefined>>() => {
  return useParamsRRD() as T
}
