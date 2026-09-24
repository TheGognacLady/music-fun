import type { BrowserContext, Request, Response } from '@playwright/test'

const issued = new WeakSet<object>()
export type TrustedPlaylist = Readonly<{
  id: string
  userId: string
  titles: readonly string[]
}>
export function assertTrusted(value: TrustedPlaylist) {
  if (!issued.has(value))
    throw new Error('Unconfirmed playlist ID; deletion forbidden.')
}

export async function installMutationSafety(
  context: BrowserContext,
  options: {
    apiUrl: string
    userId: string
    title: string
    renamed: string
    description: string
  },
) {
  const collection = new URL('playlists', options.apiUrl).href
  let createRequest: Request | undefined
  let trusted: TrustedPlaylist | undefined
  let violated = false
  let attempted = false
  let armed = false
  let stopped = false
  const matchesCreate = (request: Request) => {
    try {
      const body = request.postDataJSON()
      return (
        request.method() === 'POST' &&
        request.url() === collection &&
        body?.data?.type === 'playlists' &&
        body.data.attributes?.title === options.title &&
        body.data.attributes?.description === options.description
      )
    } catch {
      return false
    }
  }
  // Covers every page/popup, before navigation. Unknown writes fail closed.
  await context.route('**/*', async (route) => {
    const request = route.request()
    const method = request.method()
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      await route.continue()
      return
    }
    const refresh =
      method === 'POST' &&
      request.url() === new URL('auth/refresh', options.apiUrl).href
    const create = !stopped && armed && !createRequest && matchesCreate(request)
    const mutation =
      !stopped &&
      trusted &&
      ['PUT', 'DELETE'].includes(method) &&
      request.url() === collection + '/' + encodeURIComponent(trusted.id)
    if (!refresh && !create && !mutation) {
      violated = true
      await route.abort('blockedbyclient')
      return
    }
    if (create) {
      attempted = true
      createRequest = request
    }
    // Forward genuine requests/responses; do not follow mutation redirects or retry.
    try {
      const response = await route.fetch({ maxRedirects: 0, maxRetries: 0 })
      if (response.status() >= 300 && response.status() < 400) {
        violated = true
        await route.abort('blockedbyclient')
        return
      }
      await route.fulfill({ response })
    } catch {
      await route.abort('failed')
    }
  })
  return {
    get trusted() {
      return trusted
    },
    get attempted() {
      return attempted
    },
    armCreate() {
      armed = true
    },
    stop() {
      stopped = true
    },
    isCreateResponse(response: Response) {
      return (
        response.request() === createRequest &&
        matchesCreate(response.request())
      )
    },
    async confirm(response: Response) {
      if (
        trusted ||
        response.request() !== createRequest ||
        !matchesCreate(response.request()) ||
        !response.ok()
      )
        throw new Error(
          'CREATE is not confirmed; no ID authorized for mutation or cleanup.',
        )
      let data
      try {
        data = (await response.json()).data
      } catch {
        throw new Error('Invalid CREATE response; no ID authorized.')
      }
      if (
        typeof data?.id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          data.id,
        ) ||
        data.attributes?.title !== options.title ||
        data.attributes?.user?.id !== options.userId
      )
        throw new Error(
          'CREATE identity, title or owner mismatch; no ID authorized.',
        )
      trusted = Object.freeze({
        id: data.id,
        userId: options.userId,
        titles: Object.freeze([options.title, options.renamed]),
      })
      issued.add(trusted)
      return trusted
    },
    assertSafe() {
      if (violated)
        throw new Error(
          'Safety guard blocked an unauthorized mutation or redirect before forwarding it.',
        )
    },
  }
}
