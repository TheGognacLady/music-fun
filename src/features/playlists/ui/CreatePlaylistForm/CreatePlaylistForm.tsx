import {type SubmitHandler, useForm} from "react-hook-form"
import type {FormValues} from "@/features/playlists/api/playlistsApi.types.ts";
import {useCreatePlaylistMutation} from "@/features/playlists/api/playlistsApi.ts";

export const CreatePlaylistForm = () => {
    const {register, handleSubmit, reset} = useForm<FormValues>()
    const [createPlaylist] = useCreatePlaylistMutation()

    const onSubmit: SubmitHandler<FormValues> = values => {
        createPlaylist({
            data: {
                type: 'playlists',
                attributes: {
                    title: values.title,
                    description: values.description,
                }
            }
        }).unwrap().then(() => reset())
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Create new playlist</h2>
            <div>
                <input {...register('title')} placeholder={'title'}/>
            </div>
            <div>
                <input {...register('description')} placeholder={'description'}/>
            </div>
            <button>create playlist</button>
        </form>
    )
}