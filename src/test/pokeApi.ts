import { PokemonDTO } from '@/core/Pokemon/infrastructure/dto/Pokemon.dto'

const stats = (hp: number, attack: number, defense: number, speed: number): PokemonDTO['stats'] => [
  { base_stat: hp, stat: { name: 'hp' } },
  { base_stat: attack, stat: { name: 'attack' } },
  { base_stat: defense, stat: { name: 'defense' } },
  { base_stat: 50, stat: { name: 'special-attack' } },
  { base_stat: 50, stat: { name: 'special-defense' } },
  { base_stat: speed, stat: { name: 'speed' } },
]

const pokemon = (id: number, name: string, type: string, pokemonStats: PokemonDTO['stats']): PokemonDTO => ({
  id,
  name,
  height: 5,
  weight: 60,
  types: [{ slot: 1, type: { name: type } }],
  sprites: {
    other: {
      'official-artwork': { front_default: `${name}-artwork.png` },
      dream_world: { front_default: `${name}-dream.png` },
    },
  },
  stats: pokemonStats,
})

export const POKEMONS: PokemonDTO[] = [
  pokemon(25, 'pikachu', 'electric', stats(35, 55, 40, 90)),
  pokemon(4, 'charmander', 'fire', stats(39, 52, 43, 65)),
]

const respond = (body: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) } as Response)

const urlOf = (input: RequestInfo | URL): string => (input instanceof Request ? input.url : input.toString())

export const fakePokeApi = (input: RequestInfo | URL): Promise<Response> => {
  const url = urlOf(input)
  const found = POKEMONS.find(({ id }) => url.endsWith(`/pokemon/${id}`) || url.endsWith(`/pokemon/${id}/`))

  if (found) return respond(found)

  return respond({
    results: POKEMONS.map(({ id, name }) => ({ name, url: `https://pokeapi.co/api/v2/pokemon/${id}/` })),
  })
}
