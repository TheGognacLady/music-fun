import {
    type fetchTracksResponseSchema, trackAttachmentSchema, trackAttributesSchema,
    trackDataSchema, trackRelationshipsSchema,
    tracksIncludedSchema,
    tracksMetaSchema
} from "@/features/tracks/model/tracks.schemas.ts";
import {z} from "zod";

export type FetchTracksResponse = z.infer<typeof fetchTracksResponseSchema>
export type TrackData = z.infer<typeof trackDataSchema>
export type TracksIncluded = z.infer<typeof tracksIncludedSchema>
export type TracksMeta = z.infer<typeof tracksMetaSchema>
export type TrackAttributes = z.infer<typeof trackAttributesSchema>
export type TrackRelationships = z.infer<typeof trackRelationshipsSchema>
export type TrackAttachment = z.infer<typeof trackAttachmentSchema>

// Arguments
export type FetchTracksArgs = {
    pageNumber?: number
    pageSize?: number
    search?: string
    sortBy?: 'publishedAt' | 'likesCount'
    sortDirection?: 'asc' | 'desc'
    tagsIds?: string[]
    artistsIds?: string[]
    userId?: string
    includeDrafts?: boolean
    paginationType?: 'offset' | 'cursor'
    cursor?: string
}