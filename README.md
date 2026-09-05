# M.A.S & SONS — Monorepo

Japan-based exporter of used vehicles and heavy equipment. Single-company, single stock pool, FOB/C&F/CIF quotes to international buyers.

```
Frontend/   Next.js 16 · React 19 · TypeScript · Tailwind v4 · TanStack Query v5
Backend/    FastAPI (not started yet)
docs/       Shared specs — feature audit, rendering/SEO, React Query, API flow
```

## Getting started

```bash
cd Frontend && npm install && npm run dev
```

Backend setup docs will live in `Backend/` once that project starts.

## Docs

- `docs/Car Marketplace Feature Audit  Module Details.md` — the product spec both sides build against.
- `docs/API Flow Structure Guide for NextJS + FastAPI.md` — the contract between Frontend and Backend.
- `docs/RENDERING_AND_SEO_GUIDE.md`, `docs/REACT_QUERY_GUIDE.md` — Frontend-specific, kept here since they reference the shared feature spec.
