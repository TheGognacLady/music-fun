# Music Fun

Music Fun is a frontend portfolio project for browsing music tracks and managing
playlists through the external Music Fun API.

## Features

- Playlist browsing, debounced title search and pagination.
- Profile page with playlist creation, editing, deletion and cover management.
- Track browsing with cursor pagination, infinite scrolling and audio playback.
- OAuth popup sign-in, access/refresh token handling and logout.
- RTK Query caching and optimistic playlist updates with rollback on failure.
- Zod validation of API responses with user-facing error notifications.
- Socket.IO playlist-created/updated subscriptions that refresh cached lists
  with their existing filters and pagination.

The backend and identity provider are external services; this repository does
not contain a backend or a publicly reusable API credential.

## Stack

React 19, TypeScript, Vite, Redux Toolkit / RTK Query, React Router,
React Hook Form, Zod, Socket.IO, CSS Modules and Vitest.

## Local development

Use **Node.js 24.x** (see `.nvmrc`) and the pnpm version in `packageManager`.

```sh
pnpm install --frozen-lockfile
```

Copy `.env.example` to ignored `.env.local` and fill the values for your own
authorized backend account. Do not commit credentials. For local OAuth,
`VITE_DOMAIN_ADDRESS` must match the actual browser origin
(`http://127.0.0.1:3000`, not a different localhost hostname).

```sh
pnpm dev
```

The application runs at http://127.0.0.1:3000.
OAuth requires the backend/provider to allow the application's callback URL.

## Unit and integration tests

```sh
pnpm test:unit
pnpm test:unit:watch
```

Exactly five tests cover successful token refresh, preserving a session after
403, optimistic updates across multiple RTK Query caches, rollback on mutation
failure, and handling invalid API data through Zod.

These tests use an in-memory store and synthetic data. They do not load env
files, use OAuth or contact the backend. HTTP transport and Socket.IO are
mocked; unexpected network attempts fail the tests.

See [unit test details](src/tests/unit/README.md).

## Local quality checks

```sh
pnpm test:unit
pnpm exec tsc -p tsconfig.app.json --noEmit
pnpm exec tsc -p src/tests/unit/tsconfig.json --noEmit
pnpm typecheck:e2e
pnpm lint
pnpm build
```

`pnpm build` typechecks production/config code and writes the frontend to
`dist/`. It does not execute tests or OAuth. Unit and E2E TypeScript checks
remain separate. `pnpm preview` serves a local production build.

## Playwright: retained experimental work

A Chromium playlist lifecycle scenario is retained for future study.
**A successful end-to-end run against the real backend has not been established.**
Previous runs encountered transport and CREATE-response timeouts.

It is **not part of normal production verification or deployment**. Do not run
it automatically in CI: it requires manual OAuth and performs real playlist
mutations. Its safety guard restricts changes and cleanup to a confirmed
CREATE ID; without that ID it leaves a diagnostic journal rather than deleting
by name. Cleanup is best effort.

See [E2E setup and limitations](src/tests/e2e/README.md). Auth state, reports,
traces and results must remain local and must never be force-added to Git.

## Vercel deployment

- Framework: Vite; Node.js: 24.x.
- Enable Vercel Corepack with project variable `ENABLE_EXPERIMENTAL_COREPACK=1`
  so the pinned `pnpm@11.23.0` is used, rather than an inferred older pnpm.
- Install: `corepack pnpm install --frozen-lockfile`.
- Build: `pnpm build`; output: `dist`.
- `vercel.json` provides SPA fallback for direct visits and reloads on routes
  such as `/profile`, `/tracks` and `/oauth/callback`.
- Configure the four application variables below in the appropriate Vercel
  environment **before building**; redeploy after changing them.
- Set the deployed origin as `VITE_DOMAIN_ADDRESS`, without a trailing slash.
  The backend/provider must accept `<deployed-origin>/oauth/callback`;
  backend CORS/allowed-domain and Socket.IO origin policies may also need it.
- Preview deployments have different origins. Do not assume production OAuth
  settings automatically authorize every preview URL.

| Variable            | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| VITE_BASE_URL       | Absolute external API base URL, including API version/path   |
| VITE_API_KEY        | API credential required by the current browser client        |
| VITE_SOCKET_URL     | External Socket.IO server origin; socket path is /api/1.0/ws |
| VITE_DOMAIN_ADDRESS | Exact frontend origin used by OAuth                          |

**Security prerequisite:** Vite embeds referenced `VITE_*` values into the
public browser bundle. Marking a Vercel variable sensitive does not hide it
from website visitors. The current client sends `VITE_API_KEY` from the
browser. Before public deployment, confirm with the API owner that this key is
intended and permitted for public browser use. If it must stay secret, public
deployment is blocked until a separately designed server-side solution exists.
Never use a password, bearer token or refresh token as a Vite variable.

`E2E_USER_ID` and Playwright auth state are only for local E2E work and are not
needed on Vercel. Never publish the local `dist` manually with an unapproved key.

References: [Vite environment variables](https://vite.dev/guide/env-and-mode),
[Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite),
[Vercel Corepack configuration](https://vercel.com/docs/builds/configure-a-build#corepack).

## Current limits

The profile currently shows the API's first playlist page without its own
pagination controls. Real-backend E2E is experimental. Unit tests validate the
five listed behaviors, not the entire application or external API availability.
