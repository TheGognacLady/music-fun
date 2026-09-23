import type {
    CreatePlaylistArgs, FetchPlaylistsArgs, PlaylistCreatedEvent,
    PlaylistData,
    PlaylistsResponse, PlaylistUpdatedEvent, UpdatePlaylistArgs
} from "@/features/playlists/api/playlistsApi.types.ts";
import {baseApi} from "@/app/api/baseApi.ts";
import type {Images} from "@/common/types";
import {playlistCreateResponseSchema, playlistsResponseSchema} from "@/features/playlists/model";
import {withZodCatch} from "@/common/utils";
import {imagesSchema} from "@/common/schemas";
import {SOCKET_EVENTS} from "@/common/constants";
import {subscribeToEvent} from "@/common/socket";


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
            keepUnusedDataFor: 0,

            onCacheEntryAdded: async (_arg, {cacheDataLoaded, updateCachedData, cacheEntryRemoved}) => {
                await cacheDataLoaded

                const subscribes = [
                    subscribeToEvent<PlaylistCreatedEvent>(SOCKET_EVENTS.PLAYLIST_CREATED, (message) => {
                        const newPlaylist = message.payload.data
                        updateCachedData((state) => {
                            state.data.pop()
                            state.data.unshift(newPlaylist)
                            state.meta.totalCount = state.meta.totalCount + 1
                            state.meta.pagesCount = Math.ceil(state.meta.totalCount / state.meta.pageSize)
                        })

                        // socket.on(SOCKET_EVENTS.PLAYLIST_CREATED, (message: PlaylistCreatedEvent) => {
                        //
                        //     const newPlaylist = message.payload.data
                        //     updateCachedData((state) => {
                        //         state.data.pop()
                        //         state.data.unshift(newPlaylist)
                        //         state.meta.totalCount = state.meta.totalCount + 1
                        //         state.meta.pagesCount = Math.ceil(state.meta.totalCount / state.meta.pageSize)
                        //     })
                        //
                        //     //dispatch(playlistsApi.util.invalidateTags(['Playlist']))
                    }),

                    subscribeToEvent<PlaylistUpdatedEvent>(SOCKET_EVENTS.PLAYLIST_UPDATED, (message) => {
                        const newPlaylist = message.payload.data
                        updateCachedData((state)=> {
                            const index = state.data.findIndex(pl=> pl.id === newPlaylist.id)
                            if(index !== -1) {
                                state.data[index] = {...state.data[index], ...newPlaylist}
                            }

                        })


                    })
                ]


                await cacheEntryRemoved
                subscribes.forEach(unsubscribe=> unsubscribe())
            },

            providesTags:
                ['Playlist'],
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
