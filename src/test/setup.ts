import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import '@/di'

afterEach(() => {
  cleanup()
})
