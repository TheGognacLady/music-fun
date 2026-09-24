import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'test-results',
    'playwright-report',
    'blob-report',
    'playwright/.auth',
    'coverage',
    '.vercel',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/tests/e2e/**/*.ts'],
    rules: {
      // Playwright fixture callbacks named use are not React hooks.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    files: ['src/tests/e2e/fixtures.ts'],
    rules: {
      // Playwright requires destructured fixture parameters, including {}.
      'no-empty-pattern': 'off',
    },
  },
  {
    files: ['src/tests/e2e/support/playlist-api.ts'],
    rules: {
      // Original transport errors can contain auth headers; intentionally redact them.
      'preserve-caught-error': 'off',
    },
  },
])
