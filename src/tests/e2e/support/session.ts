import fs from 'node:fs/promises'
import type { BrowserContext } from '@playwright/test'
import {
  ACCESS_KEY,
  APP_URL,
  AUTH_DIR,
  AUTH_FILE,
  REFRESH_KEY,
} from './environment'

export type Session = { access: string; refresh: string }
export function minimalState(session: Session) {
  return {
    cookies: [],
    origins: [
      {
        origin: APP_URL,
        localStorage: [
          { name: ACCESS_KEY, value: session.access },
          { name: REFRESH_KEY, value: session.refresh },
        ],
      },
    ],
  }
}
export async function readSession(): Promise<Session> {
  try {
    const state = JSON.parse(await fs.readFile(AUTH_FILE, 'utf8'))
    const values = state.origins?.find(
      (o: { origin: string }) => o.origin === APP_URL,
    )?.localStorage
    const access = values?.find(
      (v: { name: string }) => v.name === ACCESS_KEY,
    )?.value
    const refresh = values?.find(
      (v: { name: string }) => v.name === REFRESH_KEY,
    )?.value
    if (
      typeof access !== 'string' ||
      !access ||
      typeof refresh !== 'string' ||
      !refresh
    )
      throw new Error()
    return { access, refresh }
  } catch {
    throw new Error(
      'No usable local session. Run pnpm e2e:auth and sign in to the test account.',
    )
  }
}
export async function currentSession(
  context: BrowserContext,
  fallback: Session,
): Promise<Session> {
  const state = await context.storageState()
  const values = state.origins.find((o) => o.origin === APP_URL)?.localStorage
  const access = values?.find((v) => v.name === ACCESS_KEY)?.value
  const refresh = values?.find((v) => v.name === REFRESH_KEY)?.value
  return access && refresh ? { access, refresh } : fallback
}
export async function saveSession(session: Session) {
  await fs.mkdir(AUTH_DIR, { recursive: true })
  const temporary = AUTH_FILE + '.tmp'
  await fs.writeFile(temporary, JSON.stringify(minimalState(session)), {
    mode: 0o600,
  })
  await fs.rename(temporary, AUTH_FILE)
}
