const createCSSVariable = (color: string) => `var(--color-${color})`

export const COLORS = {
  primary: createCSSVariable('primary'),

  bug: createCSSVariable('bug'),
  dark: createCSSVariable('dark'),
  dragon: createCSSVariable('dragon'),
  electric: createCSSVariable('electric'),
  fairy: createCSSVariable('fairy'),
  fighting: createCSSVariable('fighting'),
  fire: createCSSVariable('fire'),
  flying: createCSSVariable('flying'),
  ghost: createCSSVariable('ghost'),
  grass: createCSSVariable('grass'),
  ground: createCSSVariable('ground'),
  ice: createCSSVariable('ice'),
  normal: createCSSVariable('normal'),
  poison: createCSSVariable('poison'),
  psychic: createCSSVariable('psychic'),
  rock: createCSSVariable('rock'),
  steel: createCSSVariable('steel'),
  water: createCSSVariable('water'),
}
