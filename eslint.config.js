import vitest from '@vitest/eslint-plugin'
import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

const RAW_COLORS = 'Colors come from the variables in src/ui/styles/globals.css.'
const RAW_COLOR_PATTERN = '/#[0-9a-fA-F]{3,8}\\b|\\b(rgb|hsl)a?\\(/'
const VIEWS_DO_NOT_CALL_THE_API = 'Views do not call the API: data comes from pokemonService.'

export default [
  {
    ignores: ['dist/', 'coverage/', 'reports/'],
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tools/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      unicorn,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=${RAW_COLOR_PATTERN}]`, message: RAW_COLORS },
        { selector: `TemplateElement[value.raw=${RAW_COLOR_PATTERN}]`, message: RAW_COLORS },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'default', format: ['camelCase'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'import', format: null },
        { selector: ['variable', 'parameter'], modifiers: ['destructured'], format: null },
        { selector: ['objectLiteralProperty', 'typeProperty', 'objectLiteralMethod'], format: null },
      ],
      'unicorn/filename-case': [
        'error',
        { cases: { camelCase: true, pascalCase: true }, ignore: [/^vite-env\.d\.ts$/, /^__tests__$/] },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: VIEWS_DO_NOT_CALL_THE_API },
        { name: 'XMLHttpRequest', message: VIEWS_DO_NOT_CALL_THE_API },
      ],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/infrastructure', '**/infrastructure/**'], message: VIEWS_DO_NOT_CALL_THE_API }] },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'tools/**/*.test.ts'],
    plugins: { vitest },
    rules: {
      'vitest/expect-expect': 'error',
      'vitest/no-disabled-tests': 'error',
      'vitest/no-conditional-expect': 'error',
      'vitest/no-identical-title': 'error',
      'vitest/no-focused-tests': 'error',
    },
  },
]
