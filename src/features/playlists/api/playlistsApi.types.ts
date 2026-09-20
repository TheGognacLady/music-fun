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

//
// export type PlaylistsResponse = {
//     data: PlaylistData[]
//     meta: PlaylistMeta
// }
//
// export type PlaylistData = {
//     id: string
//     type: 'playlists'
//     attributes: PlaylistAttributes
// }
//
// export type PlaylistMeta = {
//     page: number
//     pageSize: number
//     totalCount: number
//     pagesCount: number
// }
//
// export type PlaylistAttributes = {
//     title: string
//     description: string
//     addedAt: string
//     updatedAt: string
//     order: number
//     dislikesCount: number
//     likesCount: number
//     tags: Tag[]
//     images: Images
//     user: User
//     currentUserReaction: CurrentUserReaction
// }

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



//     "data": {
//     "type": "playlists",
//         "attributes": {
//         "title": "string",
//             "description": "Cool playlist",
//             "tagIds": [
//             "3fa85f64-5717-4562-b3fc-2c963f66afa6"
//         ]
//     }
// }
