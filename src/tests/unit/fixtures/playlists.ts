import type { PlaylistsResponse } from '@/features/playlists/api/playlistsApi.types'

export function playlistsFixture(): PlaylistsResponse {
  return {
    data: ['target', 'untouched'].map((id, index) => ({
      id,
      type: 'playlists',
      attributes: {
        title: index === 0 ? 'Original title' : 'Other playlist',
        addedAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        order: index,
        dislikesCount: 0,
        likesCount: 3,
        tags: [],
        images: { main: [] },
        user: { id: 'unit-owner', name: 'Unit user' },
        currentUserReaction: 0,
      },
    })),
    meta: { page: 1, pageSize: 20, totalCount: 2, pagesCount: 1 },
  }
}
