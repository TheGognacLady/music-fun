import { request, type APIRequestContext } from '@playwright/test'
import { environment, APP_URL } from './environment'
import type { Session } from './session'
import { assertTrusted, type TrustedPlaylist } from './mutation-safety'

const API_TIMEOUT_MS = 15_000

export type Playlist = {
  id: string
  attributes: { title: string; user: { id: string } }
}
export async function apiClient(session: Session): Promise<APIRequestContext> {
  const env = environment()
  return request.newContext({
    baseURL: env.apiUrl,
    extraHTTPHeaders: {
      'API-KEY': env.apiKey,
      Authorization: 'Bearer ' + session.access,
      Origin: APP_URL,
      Referer: APP_URL + '/',
    },
    timeout: API_TIMEOUT_MS,
  })
}
export async function readyUser(api: APIRequestContext) {
  const expectedUserId = environment().userId
  let response
  try {
    response = await api.get('auth/me', { timeout: API_TIMEOUT_MS })
  } catch (error) {
    // Never attach the original error: Playwright may include request headers.
    if (error instanceof Error && error.name === 'TimeoutError')
      throw new Error(
        'auth/me: request timeout (configured timeout: ' +
          API_TIMEOUT_MS +
          ' ms).',
      )
    throw new Error('auth/me: transport/request failure.')
  }
  if (!response.ok())
    throw new Error('auth/me: HTTP status ' + response.status() + '.')

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error('auth/me: JSON/response parsing error.')
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('userId' in data) ||
    typeof data.userId !== 'string'
  )
    throw new Error(
      'auth/me: invalid response structure; expected a string userId.',
    )
  if (data.userId !== expectedUserId)
    throw new Error('auth/me: E2E_USER_ID mismatch.')
  return data.userId
}
export async function ownPlaylists(
  api: APIRequestContext,
): Promise<Playlist[]> {
  const result: Playlist[] = []
  for (let page = 1; page <= 100; page++) {
    let data
    try {
      const response = await api.get('playlists', {
        params: {
          userId: environment().userId,
          pageNumber: page,
          pageSize: 20,
        },
      })
      if (!response.ok()) throw new Error()
      data = await response.json()
      if (!Array.isArray(data.data) || !Number.isInteger(data.meta?.pagesCount))
        throw new Error()
    } catch {
      throw new Error('Could not verify own playlists using the real API.')
    }
    for (const item of data.data) {
      if (
        typeof item.id !== 'string' ||
        typeof item.attributes?.title !== 'string' ||
        item.attributes?.user?.id !== environment().userId
      ) {
        throw new Error(
          'Unexpected playlist ownership or response shape; refusing cleanup.',
        )
      }
      result.push(item)
    }
    if (page >= data.meta.pagesCount) return result
  }
  throw new Error('Too many pages to verify safely; refusing cleanup.')
}
export async function cleanupPlaylist(
  api: APIRequestContext,
  trusted: TrustedPlaylist,
) {
  assertTrusted(trusted)
  const { id, userId, titles } = trusted
  if (userId !== environment().userId)
    throw new Error('Cleanup account mismatch; refusing deletion.')
  const playlist = (await ownPlaylists(api)).find((p) => p.id === id)
  if (!playlist) return
  if (
    playlist.id !== id ||
    playlist.attributes.user.id !== userId ||
    !titles.includes(playlist.attributes.title)
  )
    throw new Error('Cleanup ownership marker changed; refusing deletion.')
  try {
    const response = await api.delete('playlists/' + encodeURIComponent(id), {
      maxRedirects: 0,
      maxRetries: 0,
    })
    if (!response.ok() && response.status() !== 404) {
      throw new Error()
    }
  } catch {
    throw new Error(
      'Cleanup DELETE failed. See local run journal for the playlist ID.',
    )
  }
  if ((await ownPlaylists(api)).some((p) => p.id === id))
    throw new Error('Cleanup deletion is not yet confirmed by API.')
}
