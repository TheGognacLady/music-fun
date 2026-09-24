import type {
  fetchTracksResponseSchema,
  trackDataSchema,
} from '@/features/tracks/model/tracks.schemas.ts'
import type { z } from 'zod'

export type FetchTracksResponse = z.infer<typeof fetchTracksResponseSchema>
export type TrackData = z.infer<typeof trackDataSchema>
