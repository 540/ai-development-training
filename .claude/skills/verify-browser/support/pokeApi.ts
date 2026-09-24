import type { Page } from '@playwright/test'

import type { PokemonDTO } from '../../../../src/core/Pokemon/infrastructure/dto/Pokemon.dto'
import { POKEMONS } from '../../../../src/test/pokeApi'

export { POKEMONS }

const POKE_API = 'https://pokeapi.co/api/v2'

type Stats = { hp: number; attack: number; defense: number; specialAttack: number; specialDefense: number; speed: number }

const DEFAULT_STATS: Stats = { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 }

export const pokemonDTO = (
  id: number,
  name: string,
  types: string[],
  stats: Partial<Stats> = {},
): PokemonDTO => {
  const s = { ...DEFAULT_STATS, ...stats }
  return {
    id,
    name,
    height: 5,
    weight: 60,
    types: types.map((type, index) => ({ slot: index + 1, type: { name: type } })),
    sprites: {
      other: {
        'official-artwork': { front_default: `${name}-artwork.png` },
        dream_world: { front_default: `${name}-dream.png` },
      },
    },
    stats: [
      { base_stat: s.hp, stat: { name: 'hp' } },
      { base_stat: s.attack, stat: { name: 'attack' } },
      { base_stat: s.defense, stat: { name: 'defense' } },
      { base_stat: s.specialAttack, stat: { name: 'special-attack' } },
      { base_stat: s.specialDefense, stat: { name: 'special-defense' } },
      { base_stat: s.speed, stat: { name: 'speed' } },
    ],
  }
}

const SPRITE =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="white" stroke="black" stroke-width="6"/><path d="M4 50h92" stroke="black" stroke-width="6"/><circle cx="50" cy="50" r="12" fill="white" stroke="black" stroke-width="6"/></svg>'

export const mockPokeApi = async (page: Page, pokemons: PokemonDTO[] = POKEMONS) => {
  await page.route(/-(artwork|dream)\.png$/, (route) => route.fulfill({ contentType: 'image/svg+xml', body: SPRITE }))
  await page.route(`${POKE_API}/**`, (route) => {
    const url = new URL(route.request().url())
    const byId = url.pathname.match(/\/pokemon\/(\d+)\/?$/)
    if (byId) {
      const found = pokemons.find(({ id }) => id === Number(byId[1]))
      return found ? route.fulfill({ json: found }) : route.fulfill({ status: 404, json: { detail: 'Not found.' } })
    }
    if (/\/pokemon\/?$/.test(url.pathname)) {
      return route.fulfill({
        json: { results: pokemons.map(({ id, name }) => ({ name, url: `${POKE_API}/pokemon/${id}/` })) },
      })
    }
    return route.fulfill({ status: 404, json: { detail: `Not mocked: ${url.pathname}` } })
  })
}
