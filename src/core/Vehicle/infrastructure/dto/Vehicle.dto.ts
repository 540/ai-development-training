/** One entry of a fueleconomy.gov menu (years, makes, models or versions) */
export interface MenuItemDTO {
  text: string
  value: string
}

/**
 * A fueleconomy.gov menu. The API sends a list, a single object when there is only one entry,
 * or null when there are none.
 */
export type MenuDTO = { menuItem: MenuItemDTO[] | MenuItemDTO } | null

/**
 * The fields of a fueleconomy.gov vehicle this app reads, in US units.
 * Every value comes as text, numbers included.
 */
export interface VehicleDTO {
  id: string
  year: string
  make: string
  model: string
  /** Alternative fuel or technology; empty for gasoline vehicles */
  atvType: string | null
  fuelType: string
  VClass: string
  drive: string
  trany: string
  cylinders: string
  displ: string
  evMotor: string
  /** Miles per gallon: city, highway and combined (MPGe for electric vehicles) */
  city08: string
  highway08: string
  comb08: string
  /** kWh per 100 miles: city, highway and combined */
  cityE: string
  highwayE: string
  combE: string
  /** Tailpipe CO₂ in grams per mile */
  co2TailpipeGpm: string
  /** Yearly fuel cost in US dollars */
  fuelCost08: string
  /** Total range in miles */
  range: string
  /** Electric range of a plug-in hybrid in miles */
  rangeA: string
  combinedUF: string
  feScore: string
  ghgScore: string
  youSaveSpend: string
}
