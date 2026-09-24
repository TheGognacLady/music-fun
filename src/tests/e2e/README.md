# MusicFun: playlist lifecycle E2E

Status: experimental, retained for study. No successful real-backend lifecycle
run has been established; previous runs hit transport/CREATE-response timeouts.
This scenario is intentionally excluded from normal verification and deployment.
Do not run it as part of a routine build or CI pipeline.

One real-backend test: create via UI, rename, reload, verify the same ID and
new title in a fresh GET, delete via UI, confirm absence in API and UI.
E2E uses the application's OAuth, RTK Query and Socket.IO. Chromium, one worker, no retries.
No HTTP or WebSocket mocks. Traces, videos and screenshots are disabled.

## First run

1. Work from C:\INCUBATOR\musicFun. Use your training account with permission
   to create and delete its own playlists on the MusicFun backend.
2. In ignored .env.local configure the existing VITE_BASE_URL, VITE_API_KEY,
   VITE_SOCKET_URL and VITE_DOMAIN_ADDRESS=http://127.0.0.1:3000.
   Add E2E_USER_ID using the actual userId from that account's auth/me response.
   Never paste real credentials into source files or this document.
   E2E_USER_ID is Node-only; it must not have a VITE_ prefix.
3. Existing playlists are left untouched; there is no five-playlist limit.
   The E2E preflight still refuses empty accounts as a historical safeguard,
   although production Zod schemas now accept zero totalCount/pagesCount. Do not delete or rename existing data for this test.
   /profile has no pagination. If the new record is not visible on the rendered
   page, the test fails and cleans up only its confirmed ID; it does not change
   paging, ordering or existing records to force a pass.
4. For a fresh checkout: pnpm install, then pnpm exec playwright install chromium.
5. Terminal A: pnpm dev. Terminal B: pnpm e2e:auth.
6. In the opened Chromium, click login and complete the real OAuth flow manually
   using the account matching E2E_USER_ID (5-minute limit). The helper checks auth/me and
   E2E_USER_ID, saves the two localStorage tokens to playwright/.auth/user.json,
   and closes the browser. OAuth-provider cookies are not retained.
7. Stop terminal A's dev server with Ctrl+C. The test starts its own server on
   127.0.0.1:3000 and intentionally refuses to reuse an existing server.
8. Run pnpm test:e2e:headed, or pnpm test:e2e for headless Chromium.

Access tokens are requested with a 15-minute TTL. Preflight does not silently
refresh an expired session: if auth/me fails, no CRUD starts. Repeat steps 5-7.
Do not use one saved session concurrently in multiple processes. If the app
refreshes tokens during the test, teardown saves the updated pair.

## Safety and cleanup

playwright/.auth/, test-results/, playwright-report/, blob-report/ and .env.*
are ignored. user.json contains real tokens in plain JSON: never share it or
force-add it to Git. The API key comes from environment, not source code.
The application still sends it from the browser; E2E does not change that.

Every run has a UUID. CREATE is armed immediately before the UI click. Only one
POST with that exact title, description and resource type is forwarded. Its
specific response must be successful and contain a UUID ID, the expected title
and E2E_USER_ID before the ID becomes trusted. The ignored journal contains only
that ID, generated names, marker and attempted flag, never credentials.

A context-wide guard is installed before navigation. PUT/DELETE can reach the
backend only at the exact trusted playlist URL. Other writes are blocked (only
auth/refresh is additionally allowed). Service workers are blocked to prevent
bypassing interception. Real responses are forwarded unchanged; mutation
redirects and automatic retries are disabled. Any policy violation fails the
test. The guard remains active in teardown.

Cleanup requires a runtime-issued trusted capability and checks ID, account,
owner and exact generated title before deleting. It cannot recover IDs by name.
Without a trusted CREATE ID, NO automatic DELETE occurs: the journal is retained
and the unique title/marker is printed for manual inspection. Successful cleanup
removes the journal. Do not force-add any auth files to Git.

Cleanup is best effort: network outages, expired credentials or killing the
process may leave a playlist. Inspect the remaining run journal and delete
only its exact record manually. Cleanup failure is reported in addition to
any original test failure. A successful cleanup does not turn a failed test
into a pass. The regular DELETE is always performed through UI.

Socket.IO remains real. External events and HTTP refetch races may expose
application bugs. Do not hide them with retries, arbitrary sleeps or mocks.
The test does not read or modify Redux internals.

## Safe checks (no real CRUD)

- pnpm typecheck:e2e
- pnpm test:e2e --list (exactly one test)
- pnpm build (normal application build; existing errors are not bypassed)
- git check-ignore .env.local playwright/.auth/user.json test-results/example.json
- git ls-files .env .env.local playwright/.auth test-results playwright-report blob-report
  (must not list secret files)

Forms are located by their headings, inputs by exact placeholders and buttons
by role/name. The card selector uses the immediate parent of its exact title
text: this is the only dependency on PlaylistItem's current DOM structure.
Waits use HTTP responses and Playwright's retrying UI assertions, not sleeps.
