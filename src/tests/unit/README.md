# Unit and RTK Query integration tests

Run `pnpm test:unit` (five tests) or `pnpm test:unit:watch`.
Typecheck: `pnpm exec tsc -p src/tests/unit/tsconfig.json`.

Vitest uses Node, disables env-file loading and selects only this directory.
Production baseQuery is replaced by controlled replies. fetch and Node socket
connections are blocked, with an after-test assertion against network attempts.
Socket.IO subscriptions and toast notifications are mocked.
No real credentials, backend, browser or OAuth are needed.

Auth tests exercise the real reauthorization wrapper.
Playlist tests exercise real RTK Query endpoints, middleware, Zod and cache
patches in a fresh store. Deferred responses distinguish optimistic changes
and rollback from subsequent refetches. No production behavior is replaced
to make assertions pass. Playwright is not part of these commands.
