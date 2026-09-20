import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createApp } from './composition-root'

const container = document.getElementById('root')

if (container === null) {
  throw new Error('Root container not found')
}

createRoot(container).render(<StrictMode>{createApp()}</StrictMode>)
