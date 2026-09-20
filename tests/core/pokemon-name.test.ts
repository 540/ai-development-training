import { describe, expect, it } from 'vitest'
import { displayNameOf } from '../../src/domain/pokemon-name'

describe('el nombre mostrado', () => {
  it.each([
    { apiName: 'bulbasaur', name: 'Bulbasaur' },
    { apiName: 'pikachu', name: 'Pikachu' },
    { apiName: 'nidoran-f', name: 'Nidoran-f' },
  ])('convierte $apiName en $name', ({ apiName, name }) => {
    expect(displayNameOf(apiName)).toBe(name)
  })
})
