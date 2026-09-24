import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { baseQuery } from '@/app/api/baseQuery'
import { playlistsApi } from '@/features/playlists/api/playlistsApi'
import { playlistsFixture } from './fixtures/playlists'
import { deferred, makeStore, until } from './support'

type Reply = { data: unknown } | { error: FetchBaseQueryError }
const transport = vi.mocked(baseQuery)
const cacheArgs = [{ userId: 'unit-owner' }, { search: 'title' }]
let store: ReturnType<typeof makeStore>
let mutationReply: ReturnType<typeof deferred<Reply>>
let refetchReply: ReturnType<typeof deferred<Reply>>
let refetches: number

function cached() {
  return cacheArgs.map(
    (args) =>
      playlistsApi.endpoints.fetchPlaylists.select(args)(store.getState()).data,
  )
}
function rename() {
  return store.dispatch(
    playlistsApi.endpoints.updatePlaylist.initiate({
      playlistId: 'target',
      body: {
        data: {
          type: 'playlists',
          attributes: {
            title: 'Renamed title',
            description: 'Unit description',
            tagIds: [],
          },
        },
      },
    }),
  )
}
function expectedRenamed() {
  const data = playlistsFixture()
  Object.assign(data.data[0].attributes, {
    title: 'Renamed title',
    description: 'Unit description',
    tagIds: [],
  })
  return data
}
beforeEach(async () => {
  store = makeStore()
  mutationReply = deferred<Reply>()
  refetchReply = deferred<Reply>()
  refetches = 0
  let initialReads = 0
  transport.mockReset().mockImplementation(async (args) => {
    if (typeof args === 'string') throw new Error('Unexpected transport args')
    if (args.method === 'PUT' && args.url === 'playlists/target')
      return mutationReply.promise
    if (args.url === 'playlists' && !args.method) {
      if (initialReads++ < cacheArgs.length) return { data: playlistsFixture() }
      refetches++
      return refetchReply.promise
    }
    throw new Error('Unexpected mocked endpoint')
  })
  await Promise.all(
    cacheArgs.map((args) =>
      store
        .dispatch(playlistsApi.endpoints.fetchPlaylists.initiate(args))
        .unwrap(),
    ),
  )
  expect(cached()).toEqual([playlistsFixture(), playlistsFixture()])
})
afterEach(async () => {
  // Settle held requests and remove subscriptions/timers without network.
  mutationReply.resolve({ data: null })
  refetchReply.resolve({ data: playlistsFixture() })
  await Promise.all(store.dispatch(playlistsApi.util.getRunningQueriesThunk()))
  store.dispatch(playlistsApi.util.resetApiState())
})

test('optimistic rename updates only the target in every relevant cache before success', async () => {
  const pending = rename()
  await until(store, () =>
    cached().every(
      (data) => data?.data[0].attributes.title === 'Renamed title',
    ),
  )
  expect(
    playlistsApi.endpoints.updatePlaylist.select(pending.requestId)(
      store.getState(),
    ).isLoading,
  ).toBe(true)
  expect(cached()).toEqual([expectedRenamed(), expectedRenamed()])
  mutationReply.resolve({ data: null })
  await expect(pending.unwrap()).resolves.toBeNull()
  // Refetch is held: this assertion still observes the optimistic cache.
  expect(cached()).toEqual([expectedRenamed(), expectedRenamed()])
  expect(refetches).toBe(2)
  refetchReply.resolve({ data: expectedRenamed() })
  await Promise.all(store.dispatch(playlistsApi.util.getRunningQueriesThunk()))
  // Zod strips unknown tagIds from the server response.
  const serverData = playlistsFixture()
  Object.assign(serverData.data[0].attributes, {
    title: 'Renamed title',
    description: 'Unit description',
  })
  expect(cached()).toEqual([serverData, serverData])
})

test('failed mutation rolls back every cache before any refetch can restore data', async () => {
  const pending = rename()
  await until(store, () =>
    cached().every(
      (data) => data?.data[0].attributes.title === 'Renamed title',
    ),
  )
  expect(cached()).toEqual([expectedRenamed(), expectedRenamed()])
  const error = { status: 500, data: { error: 'Unit server failure' } }
  mutationReply.resolve({ error })
  await expect(pending.unwrap()).rejects.toEqual(error)
  await until(store, () =>
    cached().every(
      (data) => data?.data[0].attributes.title === 'Original title',
    ),
  )
  // No refetch response has been released: only patch.undo() can restore these snapshots.
  expect(refetches).toBe(2)
  expect(cached()).toEqual([playlistsFixture(), playlistsFixture()])
})
