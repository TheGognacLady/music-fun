import {useSelector} from "react-redux";
import type {RootState} from "@/app/model/store.ts";
import {playlistsApi} from "@/features/playlists/api/playlistsApi.ts";
import {tracksApi} from "@/features/tracks/api/tracksApi.ts";

const excludeEndpoints = [
    playlistsApi.endpoints.fetchPlaylists.name,
    tracksApi.endpoints.fetchTracks.name
]

export const useGlobalLoading = () => {
    return useSelector((state: RootState) => {
        const queries = Object.values(state.baseApi.queries || {})
        const mutations = Object.values(state.baseApi.mutations || {})

        const hasActiveQueries = queries.some((query) => {
            if (query?.status !== 'pending') return

            if (excludeEndpoints.includes(query.endpointName))  {
                const completedQueries = queries.filter((q) => q?.status === 'fulfilled')
                return completedQueries.length > 0
            }

            return
        })
        const hasActiveMutations = mutations.some((mutation) => mutation?.status === 'pending')

        return hasActiveQueries || hasActiveMutations
    })
}