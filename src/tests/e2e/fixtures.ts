import { test as base, type Response } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { AUTH_DIR, environment } from './support/environment'
import {
  readSession,
  minimalState,
  currentSession,
  saveSession,
} from './support/session'
import {
  apiClient,
  readyUser,
  ownPlaylists,
  cleanupPlaylist,
} from './support/playlist-api'
import { installMutationSafety } from './support/mutation-safety'

type Run = {
  title: string
  renamed: string
  description: string
  readonly id: string | undefined
  armCreate: () => void
  isCreateResponse: (response: Response) => boolean
  confirm: (response: Response) => Promise<void>
}
export const test = base.extend<{ lifecycle: Run }>({
  storageState: async ({}, use) => {
    const session = await readSession()
    const api = await apiClient(session)
    try {
      await readyUser(api)
      if ((await ownPlaylists(api)).length === 0)
        throw new Error(
          'Empty counts are rejected by the current Zod schema. No CRUD started; report this application limitation.',
        )
    } finally {
      await api.dispose()
    }
    await use(minimalState(session))
  },
  lifecycle: [
    async ({ context }, use) => {
      const initial = await readSession()
      const marker = randomUUID()
      const journal = path.join(AUTH_DIR, 'run-' + marker + '.json')
      const names = {
        title: 'E2E lifecycle ' + marker,
        renamed: 'E2E renamed ' + marker,
        description: 'Temporary playlist for lifecycle ' + marker,
      }
      const safety = await installMutationSafety(context, {
        ...environment(),
        ...names,
      })
      const writeJournal = async () => {
        await fs.mkdir(AUTH_DIR, { recursive: true })
        await fs.writeFile(
          journal,
          JSON.stringify({
            marker,
            ...names,
            trustedId: safety.trusted?.id,
            createAttempted: safety.attempted,
          }),
          { mode: 0o600 },
        )
      }
      await writeJournal()
      const run: Run = {
        ...names,
        get id() {
          return safety.trusted?.id
        },
        armCreate: safety.armCreate,
        isCreateResponse: safety.isCreateResponse,
        confirm: async (response) => {
          await safety.confirm(response)
          await writeJournal()
        },
      }
      try {
        await use(run)
      } finally {
        // Keep guard active during teardown; API cleanup requires a separate capability.
        safety.stop()
        try {
          await writeJournal()
          const session = await currentSession(context, initial).catch(
            () => initial,
          )
          try {
            await saveSession(session)
          } catch {
            console.warn(
              'Could not persist updated session; cleanup will still be attempted.',
            )
          }
          if (!safety.trusted) {
            // Never infer IDs from names, prefixes, user ID or list position.
            console.warn(
              'No trusted CREATE ID: automatic DELETE forbidden. Check possible leftover manually: ' +
                names.title +
                ' (marker ' +
                marker +
                '). Local journal retained.',
            )
          } else {
            const api = await apiClient(session)
            try {
              await readyUser(api)
              await cleanupPlaylist(api, safety.trusted)
              await fs.unlink(journal)
            } finally {
              await api.dispose()
            }
          }
        } finally {
          safety.assertSafe()
        }
      }
    },
    { timeout: 60_000 },
  ],
})
export { expect } from '@playwright/test'
