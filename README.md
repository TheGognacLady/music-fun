# Music Fun

Music Fun is a frontend application for browsing music tracks and creating and managing playlists.

The project demonstrates authentication flows, server-state management, optimistic UI updates, API response validation, real-time updates, and automated testing in a modern React application.

## Features

- Browse playlists with debounced search and pagination
- Create, edit and delete playlists
- Upload and manage playlist covers
- Browse music tracks with cursor pagination and infinite scrolling
- Play audio tracks
- OAuth authentication via popup
- Access and refresh token handling
- Automatic token refresh and request retry
- RTK Query caching and cache invalidation
- Optimistic playlist updates with rollback on failed requests
- API response validation with Zod
- User-facing API error handling
- Real-time playlist updates with Socket.IO
- Responsive frontend interface

## Tech Stack

- React 19
- TypeScript
- Vite
- Redux Toolkit
- RTK Query
- React Router
- React Hook Form
- Zod
- Socket.IO
- CSS Modules
- Vitest
- Playwright
- ESLint
- pnpm

## Architecture Highlights

### Authentication

The application implements an OAuth popup authentication flow.

After authentication, access and refresh tokens are handled by the client. When an authorized request receives a `401` response, the application attempts to refresh the access token and retry the original request.

Concurrent unauthorized requests wait for the same refresh process instead of starting multiple refresh requests.

### Server State

RTK Query is used for API communication, caching and synchronization of server state.

Playlist mutations use optimistic updates so the interface responds immediately. If a mutation fails, affected cache entries are rolled back.

### API Validation

Zod schemas validate API responses before invalid data reaches the application state.

Validation failures are converted into controlled application errors and displayed through the normal notification flow.

### Real-Time Updates

Socket.IO subscriptions react to playlist creation and update events.

Relevant playlist queries are refreshed while preserving their current filters and pagination parameters.

## Testing

The project contains five focused Vitest tests covering important application behavior:

1. Successful `401 → token refresh → request retry`
2. Handling `403` without unnecessary refresh or logout
3. Optimistic playlist updates across multiple RTK Query cache entries
4. Rollback of optimistic changes after a failed mutation
5. Rejection and controlled handling of invalid API responses with Zod

The tests use synthetic data and an isolated in-memory store. They do not contact the real backend or require OAuth credentials.

Run the tests with:

```bash
pnpm test:unit
```

Playwright infrastructure is also retained in the project for further E2E testing and study. It is isolated from the normal production build and unit-test workflow.

## Local Development

The project uses Node.js 24.x and pnpm.

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Copy `.env.example` to `.env.local` and configure the environment variables for an authorized Music Fun API account.

For local OAuth, `VITE_DOMAIN_ADDRESS` must match the browser origin:

```text
http://127.0.0.1:3000
```

Start the development server:

```bash
pnpm dev
```

The application will be available at:

```text
http://127.0.0.1:3000
```

## Environment Variables

The application uses the following environment variables:

```text
VITE_BASE_URL
VITE_API_KEY
VITE_SOCKET_URL
VITE_DOMAIN_ADDRESS
```

`VITE_API_KEY` is optional in the frontend configuration and is added to requests only when provided.

Do not commit `.env.local`, authentication tokens, OAuth state, Playwright authentication state, or other credentials.

## Production Build

Create a production build with:

```bash
pnpm build
```

The generated frontend is written to `dist/`.

The production build includes TypeScript checking and the Vite build process.

## Live Demo

A public live demo is currently not provided because the application relies on an external educational Music Fun API with domain restrictions for public deployments.

The application runs locally with an authorized API configuration. The external backend and identity provider are not part of this repository.

## Project Status

The core frontend functionality is implemented and the production build and automated Vitest tests pass.

The project is maintained as a portfolio and learning project focused on modern React architecture, authentication, server-state management, API integration, real-time updates and testing.