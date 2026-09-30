/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

const FULL = { lines: 100, branches: 100 }

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: [...configDefaults.exclude, '.claude/**', '.stryker-tmp/**'],
    coverage: {
      provider: 'istanbul',
      all: true,
      include: ['src/**/*.{ts,tsx}', 'tools/**/*.ts'],
      exclude: [
        '**/__tests__/**',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'tools/crap/cli.ts',
        'tools/agentGuardrails.mjs',
      ],
      reporter: ['text', 'json'],
      reportsDirectory: 'reports/coverage',
      thresholds: {
        'src/core/**/domain/**': FULL,
        'src/core/**/services/**': FULL,
        'tools/**': FULL,
        'src/core/**/infrastructure/**': { lines: 90, branches: 90 },
        'src/ui/**': { lines: 60, branches: 60 },
      },
    },
  },
})
