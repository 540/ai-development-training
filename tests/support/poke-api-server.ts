import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { POKE_API_BASE_URL } from '../../src/infrastructure/poke-api'
import bulbasaur from '../fixtures/pokemon-1.json' with { type: 'json' }

const pokemonByPokedexId: Record<string, unknown> = {
  '1': bulbasaur,
}

export const pokeApiServer = setupServer(
  http.get(`${POKE_API_BASE_URL}/pokemon/:pokedexId`, ({ params }) => {
    const pokemon = pokemonByPokedexId[String(params['pokedexId'])]

    if (pokemon === undefined) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(pokemon)
  }),
)
