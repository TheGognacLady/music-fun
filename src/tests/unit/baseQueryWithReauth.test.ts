import { beforeEach, expect, test, vi } from 'vitest'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { baseQuery } from '@/app/api/baseQuery'
import { baseQueryWithReauth } from '@/app/api/baseQueryWithReauth'
import { authApi } from '@/features/auth/api/authApi'
import { AUTH_KEYS } from '@/common/constants'
import { handleErrors } from '@/common/utils/handleErrors'

vi.mock('@/common/utils/handleErrors.ts', () => ({ handleErrors: vi.fn() }))

const transport = vi.mocked(baseQuery)
function queryApi(): BaseQueryApi {
  const controller = new AbortController()
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
    dispatch: vi.fn(),
    getState: () => ({}),
    extra: undefined,
    endpoint: 'unit-query',
    type: 'query',
  }
}
beforeEach(() => {
  transport.mockReset()
  localStorage.setItem(AUTH_KEYS.accessToken, 'unit-old-access')
  localStorage.setItem(AUTH_KEYS.refreshToken, 'unit-old-refresh')
})

test('401 refreshes tokens before repeating the original request', async () => {
  const args = { url: 'playlists', params: { userId: 'unit-owner' } }
  const api = queryApi()
  const options = {}
  const success = { data: { result: 'unit-success' } }
  transport
    .mockResolvedValueOnce({ error: { status: 401, data: {} } })
    .mockResolvedValueOnce({
      data: {
        accessToken: 'unit-new-access',
        refreshToken: 'unit-new-refresh',
      },
    })
    .mockImplementationOnce(async () => {
      expect(localStorage.getItem(AUTH_KEYS.accessToken)).toBe(
        'unit-new-access',
      )
      expect(localStorage.getItem(AUTH_KEYS.refreshToken)).toBe(
        'unit-new-refresh',
      )
      return success
    })
  const logout = vi.spyOn(authApi.endpoints.logout, 'initiate')
  expect(await baseQueryWithReauth(args, api, options)).toBe(success)
  expect(transport).toHaveBeenCalledTimes(3)
  expect(transport).toHaveBeenNthCalledWith(1, args, api, options)
  expect(transport).toHaveBeenNthCalledWith(
    2,
    {
      url: 'auth/refresh',
      method: 'POST',
      body: { refreshToken: 'unit-old-refresh' },
    },
    api,
    options,
  )
  expect(transport).toHaveBeenNthCalledWith(3, args, api, options)
  expect(handleErrors).not.toHaveBeenCalled()
  expect(logout).not.toHaveBeenCalled()
})

test('403 returns the original error without refresh, logout or token changes', async () => {
  const api = queryApi()
  const result = { error: { status: 403, data: { error: 'Forbidden' } } }
  transport.mockResolvedValueOnce(result)
  const logout = vi.spyOn(authApi.endpoints.logout, 'initiate')
  expect(await baseQueryWithReauth('playlists', api, {})).toBe(result)
  expect(transport).toHaveBeenCalledTimes(1)
  expect(transport).toHaveBeenCalledWith('playlists', api, {})
  expect(handleErrors).toHaveBeenCalledExactlyOnceWith(result.error)
  expect(logout).not.toHaveBeenCalled()
  expect(api.dispatch).not.toHaveBeenCalled()
  expect(localStorage.getItem(AUTH_KEYS.accessToken)).toBe('unit-old-access')
  expect(localStorage.getItem(AUTH_KEYS.refreshToken)).toBe('unit-old-refresh')
})
