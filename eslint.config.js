import vitest from '@vitest/eslint-plugin'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/', 'reports/', '.stryker-tmp/'],
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    plugins: { vitest },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-conditional-expect': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/no-focused-tests': 'error',
    },
  },
]
