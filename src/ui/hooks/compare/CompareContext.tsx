import { createContext, FC, ReactNode, useContext, useState } from 'react'

import { MAX_COMPARED_VEHICLES } from '@/core/Vehicle/domain/Vehicle'

const STORAGE_KEY = 'comparedVehicles'

interface CompareState {
  /** Ids of the vehicles in the comparison, in the order they were added */
  ids: string[]
  isCompared: (id: string) => boolean
  isFull: boolean
  /** Adds the vehicle, or removes it when it is already in; does nothing when the comparison is full */
  toggle: (id: string) => void
}

const CompareContext = createContext<CompareState | null>(null)

const readStoredIds = (): string[] => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export const CompareProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [ids, setIds] = useState<string[]>(readStoredIds)
  const isFull = ids.length >= MAX_COMPARED_VEHICLES

  const toggle = (id: string) => {
    if (!ids.includes(id) && isFull) {
      return
    }
    const next = ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id]
    setIds(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return (
    <CompareContext.Provider value={{ ids, isFull, toggle, isCompared: (id) => ids.includes(id) }}>
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = (): CompareState => {
  const state = useContext(CompareContext)
  if (!state) {
    throw new Error('useCompare needs a CompareProvider above it')
  }
  return state
}
