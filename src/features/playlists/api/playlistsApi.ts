import type {
    CreatePlaylistArgs, FetchPlaylistsArgs,
    PlaylistData,
    PlaylistsResponse, UpdatePlaylistArgs
} from "@/features/playlists/api/playlistsApi.types.ts";
import {baseApi} from "@/app/api/baseApi.ts";
import type {Images} from "@/common/types";
import {playlistCreateResponseSchema, playlistsResponseSchema} from "@/features/playlists/model";
import { withZodCatch} from "@/common/utils";
import {imagesSchema} from "@/common/schemas";


export const playlistsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        fetchPlaylists: build.query<PlaylistsResponse, FetchPlaylistsArgs>({
            query: (params) => {
                return {
                    url: "playlists",
                    params
                }
            },
            ...withZodCatch(playlistsResponseSchema),

            providesTags: ['Playlist'],
        }),
        createPlaylist: build.mutation<{ data: PlaylistData }, CreatePlaylistArgs>({
            query: (body) => ({method: 'POST', url: 'playlists', body}),
            ...withZodCatch(playlistCreateResponseSchema),
            invalidatesTags: ['Playlist']
        }),
        removePlaylist: build.mutation<void, string>({
            query: (playlistId: string) => ({
                method: 'DELETE',
                url: `playlists/${playlistId}`
            }),
            invalidatesTags: ['Playlist']
        }),
        updatePlaylist: build.mutation<void, { playlistId: string, body: UpdatePlaylistArgs }>({
            query: ({playlistId, body}) => ({
                method: 'PUT',
                url: `playlists/${playlistId}`,
                body
            }),
            onQueryStarted: async ({playlistId, body}, {queryFulfilled, dispatch, getState}) => {

                const args = playlistsApi.util.selectCachedArgsForQuery(getState(), 'fetchPlaylists')

                const patchCollections = args.map((arg) => {
                    return (
                        dispatch(
                            playlistsApi.util.updateQueryData('fetchPlaylists', arg,
                                (state) => {
                                    const index = state.data.findIndex(playlist => playlist.id === playlistId)
                                    if (index !== -1) {
                                        state.data[index].attributes = {...state.data[index].attributes, ...body.data.attributes}

                                    }
                                },
                            ),
                        )
                    )
                })


                try {
                    await queryFulfilled
                } catch {
                    patchCollections.forEach((pathCollection) => {
                        pathCollection.undo()
                    })
                }
            },
            invalidatesTags: ['Playlist']
        }),
        uploadPlaylistCover: build.mutation<Images, { playlistId: string; file: File }>({
            query: ({playlistId, file}) => {
                const formData = new FormData()
                formData.append('file', file)
                return {
                    method: 'POST',
                    url: `playlists/${playlistId}/images/main`,
                    body: formData
                }

            },
            ...withZodCatch(imagesSchema),
        }),
        deletePlaylistCover: build.mutation<void, { playlistId: string }>({
            query: ({playlistId}) => ({
                method: 'DELETE',
                url: `playlists/${playlistId}/images/main`,

            }),
            invalidatesTags: ['Playlist']
        }),

    })

})

export const {
    useFetchPlaylistsQuery,
    useCreatePlaylistMutation,
    useRemovePlaylistMutation,
    useUpdatePlaylistMutation,
    useUploadPlaylistCoverMutation,
    useDeletePlaylistCoverMutation,
} = playlistsApi
