const POKEDEX_NUMBER_DIGITS = 3

export function pokedexNumberOf(pokedexId: number): string {
  return `#${String(pokedexId).padStart(POKEDEX_NUMBER_DIGITS, '0')}`
}
