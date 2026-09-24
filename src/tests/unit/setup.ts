import { Socket } from 'node:net'
import { beforeEach, afterEach, expect, vi } from 'vitest'

// Replace only boundaries, never RTK Query, schemas or cache lifecycle handlers.
vi.mock('@/app/api/baseQuery.ts', () => ({ baseQuery: vi.fn() }))
vi.mock('@/common/socket', () => ({
  subscribeToEvent: vi.fn(() => () => {}),
}))
vi.mock('@/common/utils/errorToast.ts', () => ({ errorToast: vi.fn() }))

let networkAttempts: number
beforeEach(() => {
  vi.clearAllMocks()
  networkAttempts = 0
  const forbiddenNetwork = () => {
    networkAttempts++
    throw new Error('Network is forbidden in unit tests')
  }
  vi.stubGlobal('fetch', vi.fn(forbiddenNetwork))
  // Also prevents bypass through Node HTTP/HTTPS or Socket.IO.
  vi.spyOn(Socket.prototype, 'connect').mockImplementation(forbiddenNetwork)
  const values = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, String(value))
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size
    },
  } satisfies Storage)
})
afterEach(() => {
  try {
    expect(networkAttempts, 'No attempted real network access').toBe(0)
  } finally {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  }
})
