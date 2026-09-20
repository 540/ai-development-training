import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { pokeApiServer } from './poke-api-server'

beforeAll(() => {
  pokeApiServer.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  pokeApiServer.resetHandlers()
})

afterAll(() => {
  pokeApiServer.close()
})
