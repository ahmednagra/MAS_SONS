# M.A.S & SONS — Engineering Rules

Monorepo: `Frontend/` (Next.js 16, Turbopack, Cache Components · React 19 · TypeScript strict ·
Tailwind v4 · TanStack Query v5) and `Backend/` (FastAPI, not started yet). Shared docs live in
`docs/` at this root, not inside either project.

Full detail: `docs/API Flow Structure Guide for NextJS + FastAPI.md`, `docs/REACT_QUERY_GUIDE.md`,
`docs/RENDERING_AND_SEO_GUIDE.md`, `docs/Car Marketplace Feature Audit  Module Details.md`.

Run all `npm`/Next.js commands from `Frontend/`, not this root — there is no `package.json` here.

## Business model

Single-company Japan-based exporter of used vehicles and heavy equipment. No multi-dealer
aggregation — one stock pool, one seller. Two audiences, two route groups:

- `(storefront)` — English/USD, international buyers. SEO-critical.
- `(jp)` — Japanese, domestic sellers (buyback leads). Each has its own root `<html>`.

## Architecture law

```
Component -> *.client.ts -> /api/v0/* -> *.server.ts -> FastAPI   (browser, shared endpoints)
Component -> *.actions.ts (Server Action) -> *.server.ts -> FastAPI   (browser, web-only mutations)
Server Component -> *.server.ts -> FastAPI   (no HTTP hop)
```

The browser never calls FastAPI directly — no exceptions short of a signed upload URL.

## Rendering

- Public pages (`stock/`, `destinations/`) use `"use cache"` + PPR — no React Query.
- App surfaces (`(app)/admin`, buyer account) use React Query — no `"use cache"`.
- `updateTag(tag)` after any mutation that affects a cached public page. `revalidateTag` needs a
  `profile` second argument as of Next.js 16 — default to `updateTag` unless that's specifically needed.

## Services

Canonical shape per feature: `{feature}.client.ts`, `{feature}.server.ts`, `index.ts`. Endpoint
strings live only in `services/api/endpoints.ts`.

## React Query

`queryKeys.*` from `lib/react-query/query-keys.ts`. Narrow invalidation, never `.all`. `unwrap()`
from `lib/api-result.ts` for every service call — don't hand-roll error checks.

## Quality gate

Run from `Frontend/`:

```bash
npx tsc --noEmit && npm run lint
```

## Git

Don't commit, branch, or push unless asked.
