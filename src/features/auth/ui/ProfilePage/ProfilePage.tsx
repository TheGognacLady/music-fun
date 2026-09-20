import {useGetMeQuery} from "@/features/auth/api/authApi.ts";
import {useFetchPlaylistsQuery} from "@/features/playlists/api/playlistsApi.ts";
import {PlaylistsList} from "@/features/playlists/ui/PlaylistList/PlaylistsList.tsx";
import {CreatePlaylistForm} from "@/features/playlists/ui/CreatePlaylistForm/CreatePlaylistForm.tsx";
import s from './ProfilePage.module.css'
import {SkeletonLoader} from "@/common/utils/Skeleton Loader.tsx";
import {Navigate} from "react-router";
import {Path} from "@/common/routing/paths.ts";

export const ProfilePage = () => {
    const {data: meResponse, isLoading: isMeLoading} = useGetMeQuery()

    const {data: playlistsResponse, isLoading} = useFetchPlaylistsQuery({
        userId: meResponse?.userId,
    }, {skip: !meResponse?.userId})


    if (isMeLoading || isLoading) {
        return <SkeletonLoader title={'Loading...'}/>
    }
    if(!isMeLoading && !meResponse) return <Navigate to={Path.Playlists}/>

    return (
        <div>
            <h1>{meResponse?.login} page</h1>
            <div className={s.container}>
                <CreatePlaylistForm/>
                <PlaylistsList playlists={playlistsResponse?.data || []} isPlaylistsLoading={isLoading || isMeLoading}/>
            </div>

        </div>
    )
}