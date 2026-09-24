import { Mutex } from 'async-mutex'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { baseQuery } from '@/app/api/baseQuery.ts'
import { areTokens, handleErrors } from '@/common/utils'
import { AUTH_KEYS } from '@/common/constants'
import { baseApi } from '@/app/api/baseApi.ts'
import type { authApi } from '@/features/auth/api/authApi.ts'

const mutex = new Mutex()

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock()

  let result = await baseQuery(args, api, extraOptions)
  const requestUrl = typeof args === 'string' ? args : args.url
  // A failed logout must not recursively start refresh/logout again.
  if (
    result.error &&
    result.error.status === 401 &&
    requestUrl !== 'auth/logout' &&
    localStorage.getItem(AUTH_KEYS.refreshToken)
  ) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()
      try {
        const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken)

        const refreshResult = await baseQuery(
          {
            url: 'auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions,
        )
        if (refreshResult.data && areTokens(refreshResult.data)) {
          localStorage.setItem(
            AUTH_KEYS.refreshToken,
            refreshResult.data.refreshToken,
          )
          localStorage.setItem(
            AUTH_KEYS.accessToken,
            refreshResult.data.accessToken,
          )
          result = await baseQuery(args, api, extraOptions)
        } else {
          // authApi injects logout into this shared API; import its type only.
          api.dispatch((baseApi as typeof authApi).endpoints.logout.initiate())
        }
      } finally {
        release()
      }
    } else {
      await mutex.waitForUnlock()
      result = await baseQuery(args, api, extraOptions)
    }
  }

  if (result.error && result.error.status !== 401) {
    handleErrors(result.error)
  }

  return result
}
