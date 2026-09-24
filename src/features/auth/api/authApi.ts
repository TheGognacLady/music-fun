import { baseApi } from '@/app/api/baseApi.ts'
import type {
  LoginArgs,
  MeResponse,
} from '@/features/auth/api/authApi.types.ts'
import { AUTH_KEYS } from '@/common/constants'
import { withZodCatch } from '@/common/utils'
import {
  loginResponseSchema,
  meResponseSchema,
} from '@/features/auth/model/auth.schemas.ts'

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<MeResponse, void>({
      query: () => `auth/me`,
      ...withZodCatch(meResponseSchema),
      providesTags: ['Auth'],
    }),
    login: build.mutation({
      query: (payload: LoginArgs) => ({
        method: 'POST',
        url: 'auth/login',
        body: { ...payload, accessTokenTTL: '15m' },
      }),
      ...withZodCatch(loginResponseSchema),
      onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
        try {
          const res = await queryFulfilled
          localStorage.setItem(AUTH_KEYS.accessToken, res.data.accessToken)
          localStorage.setItem(AUTH_KEYS.refreshToken, res.data.refreshToken)

          dispatch(authApi.util.invalidateTags(['Auth']))
        } catch {
          // Request/schema errors are already handled by the API layer.
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => {
        const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken)
        return {
          method: 'POST',
          url: 'auth/logout',
          body: { refreshToken },
        }
      },
      onQueryStarted: async (_args, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled
          localStorage.removeItem(AUTH_KEYS.refreshToken)
          localStorage.removeItem(AUTH_KEYS.accessToken)
          dispatch(baseApi.util.resetApiState())
        } catch {
          // Keep the existing session when logout is not confirmed.
        }
      },
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi
