import { defineConfig } from '@playwright/test'
import { APP_URL } from './src/tests/e2e/support/environment'

export default defineConfig({
  testDir: './src/tests/e2e',
  testMatch: 'playlist-lifecycle.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: APP_URL,
    browserName: 'chromium',
    serviceWorkers: 'block',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  webServer: {
    command: 'pnpm dev',
    url: APP_URL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
