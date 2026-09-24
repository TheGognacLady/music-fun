import { chromium } from '@playwright/test'
import {
  APP_URL,
  ACCESS_KEY,
  REFRESH_KEY,
  environment,
} from './support/environment'
import { saveSession } from './support/session'
import { apiClient, readyUser } from './support/playlist-api'

async function main() {
  environment()
  const browser = await chromium.launch({ headless: false })
  try {
    const context = await browser.newContext()
    const page = await context.newPage()
    console.log(
      'Sign in using login in the opened browser. Use only your E2E test account. Waiting up to 5 minutes.',
    )
    await page.goto(APP_URL)
    await page.waitForFunction(
      ({ access, refresh }) =>
        Boolean(localStorage.getItem(access) && localStorage.getItem(refresh)),
      { access: ACCESS_KEY, refresh: REFRESH_KEY },
      { timeout: 300_000 },
    )
    const session = await page.evaluate(
      ({ access, refresh }) => ({
        access: localStorage.getItem(access)!,
        refresh: localStorage.getItem(refresh)!,
      }),
      { access: ACCESS_KEY, refresh: REFRESH_KEY },
    )
    const api = await apiClient(session)
    try {
      await readyUser(api)
    } finally {
      await api.dispose()
    }
    await saveSession(session)
    console.log(
      'Test-account session saved to ignored playwright/.auth/user.json. Stop the dev server, then run pnpm test:e2e.',
    )
  } finally {
    await browser.close()
  }
}
main().catch(() => {
  console.error(
    'Session preparation failed. Check the dev server, E2E_USER_ID and OAuth login; no credentials were printed.',
  )
  process.exitCode = 1
})
