import { loadEnv } from 'vite'
import path from 'node:path'

export const APP_URL = 'http://127.0.0.1:3000'
export const AUTH_DIR = path.resolve('playwright/.auth')
export const AUTH_FILE = path.join(AUTH_DIR, 'user.json')
export const ACCESS_KEY = 'musicfun-access-token'
export const REFRESH_KEY = 'musicfun-refresh-token'

export function environment() {
  const env = { ...loadEnv('development', process.cwd(), ''), ...process.env }
  const apiUrl = env.VITE_BASE_URL
  const apiKey = env.VITE_API_KEY
  const userId = env.E2E_USER_ID
  if (!apiUrl || !apiKey || !userId) {
    throw new Error(
      'Set VITE_BASE_URL, VITE_API_KEY and E2E_USER_ID in ignored .env.local.',
    )
  }
  if (env.VITE_DOMAIN_ADDRESS !== APP_URL) {
    throw new Error('VITE_DOMAIN_ADDRESS must equal http://127.0.0.1:3000.')
  }
  const url = new URL(apiUrl)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'VITE_BASE_URL must be an HTTPS API URL without credentials or query parameters.',
    )
  }
  return { apiUrl: apiUrl.replace(/\/?$/, '/'), apiKey, userId }
}
