import { test, expect } from './fixtures'
import { environment } from './support/environment'

test('playlist lifecycle: create, rename, reload, delete', async ({
  page,
  lifecycle: run,
}) => {
  const browserErrors: string[] = []
  page.on('pageerror', () => browserErrors.push('Unhandled browser error'))
  const env = environment()
  const collection = new URL('playlists', env.apiUrl).href
  const ownList = (response: import('@playwright/test').Response) => {
    const url = new URL(response.url())
    return (
      response.request().method() === 'GET' &&
      url.origin + url.pathname === collection &&
      url.searchParams.get('userId') === env.userId
    )
  }
  const heading = (title: string) =>
    page.getByText('title: ' + title, { exact: true })
  // PlaylistItem's immediate parent of the title contains its action buttons.
  const card = (title: string) => heading(title).locator('..')

  await test.step('Open own profile', async () => {
    const loaded = page.waitForResponse(ownList)
    await page.goto('/profile')
    expect((await loaded).ok()).toBeTruthy()
    await expect(page).toHaveURL(/\/profile$/)
    await expect(
      page.getByRole('heading', { name: 'Create new playlist', exact: true }),
    ).toBeVisible()
  })

  await test.step('Create through UI and remember the backend ID', async () => {
    const form = page.locator('form').filter({
      has: page.getByRole('heading', {
        name: 'Create new playlist',
        exact: true,
      }),
    })
    await form.getByPlaceholder('title', { exact: true }).fill(run.title)
    await form
      .getByPlaceholder('description', { exact: true })
      .fill(run.description)
    run.armCreate()
    const created = page.waitForResponse(run.isCreateResponse)
    await form
      .getByRole('button', { name: 'create playlist', exact: true })
      .click()
    const response = await created
    await run.confirm(response)
    await expect(heading(run.title)).toHaveCount(1)
    await expect(heading(run.title)).toBeVisible()
  })

  await test.step('Rename through UI and wait for the real PUT', async () => {
    await expect(card(run.title)).toHaveCount(1)
    await card(run.title)
      .getByRole('button', { name: 'Update playlist', exact: true })
      .click()
    const form = page.locator('form').filter({
      has: page.getByRole('heading', { name: 'Edit playlist', exact: true }),
    })
    await form.getByPlaceholder('title', { exact: true }).fill(run.renamed)
    const updated = page.waitForResponse(
      (r) =>
        r.url() === collection + '/' + run.id && r.request().method() === 'PUT',
    )
    await form.getByRole('button', { name: 'save', exact: true }).click()
    expect((await updated).ok(), 'Rename request should succeed').toBeTruthy()
    await expect(heading(run.renamed)).toHaveCount(1)
    await expect(heading(run.renamed)).toBeVisible()
  })

  await test.step('Reload and verify the same ID and new title in fresh server data', async () => {
    const reloaded = page.waitForResponse(ownList)
    await page.reload()
    const response = await reloaded
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    const saved = body.data?.find((p: { id: string }) => p.id === run.id)
    expect(saved?.attributes?.title).toBe(run.renamed)
    expect(saved?.attributes?.user?.id).toBe(env.userId)
    await expect(heading(run.renamed)).toHaveCount(1)
    await expect(heading(run.renamed)).toBeVisible()
    await expect(heading(run.title)).toHaveCount(0)
  })

  await test.step('Delete through UI and confirm server and UI absence', async () => {
    await expect(card(run.renamed)).toHaveCount(1)
    page.once('dialog', async (dialog) => {
      if (
        dialog.type() !== 'confirm' ||
        dialog.message() !== 'Are you sure you want to delete playlist?'
      ) {
        await dialog.dismiss()
        return
      }
      await dialog.accept()
    })
    const deleted = page.waitForResponse(
      (r) =>
        r.url() === collection + '/' + run.id &&
        r.request().method() === 'DELETE',
    )
    await card(run.renamed)
      .getByRole('button', { name: 'Delete playlist', exact: true })
      .click()
    expect((await deleted).ok(), 'Delete request should succeed').toBeTruthy()
    // A fresh navigation prevents a late pre-delete refetch being mistaken for confirmation.
    const refreshed = page.waitForResponse(ownList)
    await page.reload()
    const response = await refreshed
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(Array.isArray(body.data)).toBeTruthy()
    expect(body.data.some((p: { id: string }) => p.id === run.id)).toBe(false)
    await expect(heading(run.renamed)).toHaveCount(0)
    await expect(
      page.getByRole('heading', { name: 'Create new playlist', exact: true }),
    ).toBeVisible()
  })
  expect(
    browserErrors,
    'The browser must not have unhandled errors',
  ).toHaveLength(0)
  await expect(
    page.getByText('Zod Error Details are in console', { exact: true }),
  ).toHaveCount(0)
})
