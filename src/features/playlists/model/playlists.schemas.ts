import { z } from 'zod'
import {
  currentUserReactionSchema,
  imagesSchema,
  tagSchema,
  userSchema,
} from '@/common/schemas'

export const playlistMetaSchema = z.object({
  page: z.int().positive(),
  pageSize: z.int().positive(),
  totalCount: z.int().nonnegative(),
  pagesCount: z.int().nonnegative(),
})

export const playlistAttributesSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  addedAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  order: z.int(),
  dislikesCount: z.int().nonnegative(),
  likesCount: z.int().nonnegative(),
  tags: z.array(tagSchema),
  images: imagesSchema,
  user: userSchema,
  currentUserReaction: currentUserReactionSchema,
})

export const playlistDataSchema = z.object({
  id: z.string(),
  type: z.literal('playlists'),
  attributes: playlistAttributesSchema,
})

export const playlistsResponseSchema = z.object({
  data: z.array(playlistDataSchema),
  meta: playlistMetaSchema,
})

export const playlistCreateResponseSchema = z.object({
  data: playlistDataSchema,
})
