import * as router from '@/ui/hooks/router'
import { vitest } from 'vitest'

export const mockUrlParams = <T extends Record<string, string | undefined>>(
  params: T
) => {
  vitest.spyOn(router, 'useParams').mockReturnValue(params)
}
