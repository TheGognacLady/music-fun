import { expect, test, vi } from 'vitest'
import { baseQuery } from '@/app/api/baseQuery'
import { playlistsApi } from '@/features/playlists/api/playlistsApi'
import { errorToast } from '@/common/utils/errorToast'
import { playlistsFixture } from './fixtures/playlists'
import { makeStore } from './support'

test('invalid API data is rejected by Zod and becomes the handled RTK Query schema error', async () => {
  const store = makeStore()
  const valid = playlistsFixture()
  const invalid = {
    ...valid,
    data: [
      {
        ...valid.data[0],
        attributes: { ...valid.data[0].attributes, title: 42 },
      },
    ],
  }
  vi.mocked(baseQuery).mockReset().mockResolvedValue({ data: invalid })
  const args = { userId: 'unit-owner' }
  const request = store.dispatch(
    playlistsApi.endpoints.fetchPlaylists.initiate(args),
  )
  try {
    const result = await request
    expect(result.isError).toBe(true)
    expect(result.isSuccess).toBe(false)
    expect(result.error).toEqual({
      status: 'CUSTOM_ERROR',
      error: 'Schema validation failed',
    })
    expect(result.data).toBeUndefined()
    expect(
      playlistsApi.endpoints.fetchPlaylists.select(args)(store.getState()).data,
    ).toBeUndefined()
    expect(errorToast).toHaveBeenCalledTimes(1)
    expect(errorToast).toHaveBeenCalledWith(
      'Zod Error Details are in console',
      expect.arrayContaining([
        expect.objectContaining({
          code: 'invalid_type',
          path: ['data', 0, 'attributes', 'title'],
        }),
      ]),
    )
  } finally {
    request.unsubscribe()
    store.dispatch(playlistsApi.util.resetApiState())
  }
})
