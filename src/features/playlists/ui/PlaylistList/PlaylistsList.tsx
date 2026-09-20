import s from './PlaylistsList.module.css'
import { useState} from "react";
import {useForm} from "react-hook-form";
import type {PlaylistData, UpdateFormValues} from "@/features/playlists/api/playlistsApi.types.ts";
import {useRemovePlaylistMutation} from "@/features/playlists/api/playlistsApi.ts";
import {EditPlaylistForm} from "@/features/playlists/ui/EditPlaylistForm/EditPlaylistForm.tsx";
import {PlaylistItem} from "@/features/playlists/ui/PlaylistItem/PlaylistItem.tsx";


type Props = {
    playlists: PlaylistData[]
    isPlaylistsLoading:boolean
}
export const PlaylistsList = ({playlists, isPlaylistsLoading}: Props)=> {

    const [playlistId, setPlaylistId] = useState<string | null>("")

    const {register, handleSubmit, reset} = useForm<UpdateFormValues>()
    const [removePlaylist] = useRemovePlaylistMutation()

    const removePlaylistHandler = (playlistId: string) => {
        if (confirm('Are you sure you want to delete playlist?')) {
            removePlaylist(playlistId)
        }
    }


    const editPlaylistHandler = (playlist: PlaylistData | null) => {
        if (playlist) {
            setPlaylistId(playlist.id)
            reset({
                title: playlist.attributes.title,
                description: playlist.attributes.description,
                tagIds: playlist.attributes.tags.map(tag => tag.id)
            })
        } else {
            setPlaylistId(null)
        }

    }
    return (
        <div className={s.items}>
            {!playlists.length && !isPlaylistsLoading && <h2>Playlists not found</h2>}
            {playlists.map(playlist => {
                const isEditing = playlist.id === playlistId

                return (
                    <div className={s.item} key={playlist.id}>
                        {isEditing ?
                            <EditPlaylistForm playlistId={playlistId} setPlaylistId={setPlaylistId}
                                              editPlaylist={editPlaylistHandler}
                                              register={register} handleSubmit={handleSubmit}/>
                            :
                            <PlaylistItem playlist={playlist} editPlaylistHandler={editPlaylistHandler}
                                          removePlaylistHandler={removePlaylistHandler}/>
                        }


                    </div>
                )
            })}
        </div>
    )
}