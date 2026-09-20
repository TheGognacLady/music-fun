import type {PlaylistData} from "@/features/playlists/api/playlistsApi.types.ts";
import {PlaylistCover} from "@/features/playlists/ui/PlaylistItem/PlaylistCover/PlaylistCover.tsx";
import {PlaylistDescription} from "@/features/playlists/ui/PlaylistItem/PlaylistDescription/PlaylistDescription.tsx";

type PropsType = {
    playlist: PlaylistData,
    removePlaylistHandler: (playlistId: string) => void,
    editPlaylistHandler: (playlist: PlaylistData) => void,
}
export const PlaylistItem = ({playlist, removePlaylistHandler, editPlaylistHandler}: PropsType) => {

    return (
        <div>
            <PlaylistCover playlistId={playlist.id} images={playlist.attributes.images}/>
            <PlaylistDescription attributes={playlist.attributes}/>

            <button onClick={() => removePlaylistHandler(playlist.id)}>Delete playlist</button>
            <button onClick={() => editPlaylistHandler(playlist)}>Update playlist</button>
        </div>
    )
}