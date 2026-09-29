import { useEffect, useState } from 'react'

import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { vehicleService } from '@/core/Vehicle/services/Vehicle.service'

export const useComparedVehicles = (ids: string[]) => {
  const [vehicles, setVehicles] = useState<Vehicle[] | undefined>(undefined)
  const [hasError, setHasError] = useState(false)
  const key = ids.join(',')

  useEffect(() => {
    setHasError(false)

    Promise.all(key.split(',').filter(Boolean).map(vehicleService.findById))
      .then(setVehicles)
      .catch(() => setHasError(true))
  }, [key])

  return { vehicles, hasError }
}
