import {
  type SubmitHandler,
  type UseFormHandleSubmit,
  type UseFormRegister,
} from 'react-hook-form'
import type { UpdateFormValues } from '@/features/playlists/api/playlistsApi.types.ts'
import { useUpdatePlaylistMutation } from '@/features/playlists/api/playlistsApi.ts'

type PropsType = {
  playlistId: string
  setPlaylistId: (playlistId: null) => void
  editPlaylist: (playlist: null) => void
  register: UseFormRegister<UpdateFormValues>
  handleSubmit: UseFormHandleSubmit<UpdateFormValues>
}

export const EditPlaylistForm = ({
  playlistId,
  setPlaylistId,
  editPlaylist,
  register,
  handleSubmit,
}: PropsType) => {
  const [updatePlaylist] = useUpdatePlaylistMutation()

  const onSubmit: SubmitHandler<UpdateFormValues> = (values) => {
    if (!playlistId) return
    updatePlaylist({
      playlistId,
      body: {
        data: {
          type: 'playlists',
          attributes: {
            title: values.title,
            description: values.description,
            tagIds: values.tagIds,
          },
        },
      },
    })
    setPlaylistId(null)
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Edit playlist</h2>
      <div>
        <input {...register('title')} placeholder={'title'} />
      </div>
      <div>
        <input {...register('description')} placeholder={'description'} />
      </div>
      <button type={'submit'}>save</button>
      <button type={'button'} onClick={() => editPlaylist(null)}>
        cancel
      </button>
    </form>
  )
}
