import { type meResponseSchema } from '@/features/auth/model/auth.schemas.ts'
import { z } from 'zod'

export type MeResponse = z.infer<typeof meResponseSchema>

export type LoginArgs = {
  code: string
  redirectUri: string
  rememberMe: boolean
  accessTokenTTL?: string
}
