import {z} from "zod";
import {
    playlistAttributesSchema,
    playlistDataSchema,
    playlistMetaSchema,
    playlistsResponseSchema
} from "@/features/playlists/model";

export type PlaylistMeta = z.infer<typeof playlistMetaSchema>
export type PlaylistAttributes = z.infer<typeof playlistAttributesSchema>
export type PlaylistData = z.infer<typeof playlistDataSchema>
export type PlaylistsResponse = z.infer<typeof playlistsResponseSchema>


// Arguments
export type FetchPlaylistsArgs = {
    pageNumber?: number
    pageSize?: number
    search?: string
    sortBy?: 'addedAt' | 'likesCount'
    sortDirection?: 'asc' | 'desc'
    tagsIds?: string[]
    userId?: string
    trackId?: string
}

export type CreatePlaylistArgs = {
    data: {
        type: 'playlists',
        attributes:  FormValues
    }
}
export type FormValues = {
    title: string,
    description: string,
}

export type UpdateFormValues = {
    title: string,
    description: string,
    tagIds: string[]
}
export type UpdatePlaylistArgs = {
    data: {
        type: string,
        attributes: UpdateFormValues
    }
}

//WebSockets Events

export type PlaylistCreatedEvent = {
    type: 'tracks.playlist-created'
    payload: {
        data: PlaylistData
    }
}

export type PlaylistUpdatedEvent = {
    type: 'tracks.playlist-updated'
    payload: {
        data: PlaylistData
    }
}

