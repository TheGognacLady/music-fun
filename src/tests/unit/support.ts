import { configureStore } from '@reduxjs/toolkit'
import { playlistsApi } from '@/features/playlists/api/playlistsApi'

export function makeStore() {
  return configureStore({
    reducer: { [playlistsApi.reducerPath]: playlistsApi.reducer },
    middleware: (defaults) => defaults().concat(playlistsApi.middleware),
  })
}
export function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}
// State-driven synchronization: no sleep, timer polling or arbitrary delay.
export function until(
  store: ReturnType<typeof makeStore>,
  predicate: () => boolean,
) {
  if (predicate()) return Promise.resolve()
  return new Promise<void>((resolve) => {
    const unsubscribe = store.subscribe(() => {
      if (predicate()) {
        unsubscribe()
        resolve()
      }
    })
  })
}
