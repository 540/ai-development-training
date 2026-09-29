import { useEffect, useState } from 'react'

import { Vehicle } from '@/core/Vehicle/domain/Vehicle'
import { vehicleService } from '@/core/Vehicle/services/Vehicle.service'

export const useVehicles = (year: number, make: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[] | undefined>(undefined)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
    setVehicles(undefined)

    vehicleService
      .listByYearAndMake(year, make)
      .then(setVehicles)
      .catch(() => setHasError(true))
  }, [year, make])

  return { vehicles, hasError }
}
