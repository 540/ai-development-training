import { Vehicle } from './Vehicle'

export interface VehicleRepository {
  listByYearAndMake: (year: number, make: string) => Promise<Vehicle[]>
  findById: (id: string) => Promise<Vehicle>
}
