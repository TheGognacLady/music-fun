import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Unit tests never load .env or .env.local.
  envDir: false,
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/tests/unit/**/*.test.ts'],
    setupFiles: ['src/tests/unit/setup.ts'],
  },
})
