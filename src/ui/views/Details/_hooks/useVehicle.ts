import { useEffect, useState } from 'react'

import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { vehicleService } from '@/core/Vehicle/services/Vehicle.service'

export const useVehicle = (id: string) => {
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
    setVehicle(undefined)

    vehicleService
      .findById(id)
      .then(setVehicle)
      .catch(() => setHasError(true))
  }, [id])

  return { vehicle, hasError }
}
