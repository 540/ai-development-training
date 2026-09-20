import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/support/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    coverage: {
      provider: 'istanbul',
      all: true,
      include: ['src/**/*.{ts,tsx}', 'tools/**/*.ts'],
      exclude: ['src/main.tsx', 'tools/crap/cli.ts'],
      reporter: ['text', 'json'],
      reportsDirectory: 'reports/coverage',
      thresholds: {
        'src/domain/**': { lines: 100, branches: 100 },
        'src/application/**': { lines: 100, branches: 100 },
        'src/infrastructure/**': { lines: 90, branches: 90 },
        'src/ui/**': { lines: 60, branches: 60 },
        'tools/**': { lines: 100, branches: 100 },
      },
    },
  },
})
