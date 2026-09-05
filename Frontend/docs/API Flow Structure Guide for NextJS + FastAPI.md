# API Flow Structure Guide for Next.js 16 + FastAPI

Companion documents: `docs/REACT_QUERY_GUIDE.md` (app-surface data layer), `docs/RENDERING_AND_SEO_GUIDE.md`
(public-page rendering). Build the small `lib/` files this references once — every feature service
depends on them.

---

## Two Paths, Chosen by Caller and by Consumer Count

```
Browser, endpoint also used by another client (mobile app, partner API):
  Component -> Client Service (*.client.ts) -> /api/v0/* Route -> Server Service (*.server.ts) -> FastAPI

Browser, web-only mutation (a form, a dashboard action):
  Component -> Server Action (*.actions.ts) -> Server Service (*.server.ts) -> FastAPI

Server Component / SSR prefetch (any caller):
  Server Component -> Server Service (*.server.ts) -> FastAPI   (no HTTP hop)
```

Default to a **Server Action** for a web-only mutation — it's less code (no client-service wrapper,
no route.ts, no manual fetch), and React 19's `useActionState`/`useFormStatus` give pending/error
state for free. Reach for the `/api/v0/*` route only when something other than this web app also
needs to call it.

> The browser never calls FastAPI directly, in either path — no exceptions short of a signed
> upload URL (see below). This is the one rule everything else here supports.

---

## Hard Rule: No Direct Backend Calls From the Browser

```ts
// ❌
const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/uploads`, {
  headers: { Authorization: `Bearer ${token}` }, body: formData,
});
```
```ts
// ✅
const res = await nextjsApiClient.post('/api/v0/uploads', formData);
```

The one exception is large binary uploads: request a short-lived **signed upload URL** from
`/api/v0/*` (server-side, using the real token) and upload directly to that URL — the browser never
holds the backend origin or a bearer token otherwise.

---

## Shared Infrastructure (Build Once)

```ts
// lib/auth-utils.ts
import { NextRequest } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';
const PLACEHOLDER_BEARERS = new Set(['', 'null', 'undefined', 'cookie-session']);

export function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    if (token && !PLACEHOLDER_BEARERS.has(token.toLowerCase())) return token;
  }
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
}
```

```ts
// lib/csrf.ts
const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'X-CSRF-Token';
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const isUnsafeMethod = (m?: string) => UNSAFE.has((m ?? 'GET').toUpperCase());

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/)?.[1] ?? null;
}
```

```ts
// lib/nextjs-api.ts — browser -> this app's own /api/v0/*
class NextJSApiClient {
  private async request<T>(endpoint: string, options: RequestInit & { auth?: boolean } = {}) {
    const { auth = true, ...rest } = options;
    const headers = new Headers(rest.headers);
    if (!headers.has('Content-Type') && !(rest.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (auth && isUnsafeMethod(rest.method)) {
      const csrf = getCsrfToken();
      if (csrf) headers.set(CSRF_HEADER, csrf);
    }
    const res = await fetch(endpoint, { credentials: 'include', ...rest, headers });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    return { data: res.ok ? data : null, error: res.ok ? null : new Error(data?.error ?? res.statusText), status: res.status };
  }
  get<T>(endpoint: string, opts?: RequestInit) { return this.request<T>(endpoint, { ...opts, method: 'GET' }); }
  post<T>(endpoint: string, body?: unknown, opts?: RequestInit) {
    return this.request<T>(endpoint, { ...opts, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
  }
}
export const nextjsApiClient = new NextJSApiClient();
```

```ts
// lib/server-api.ts — this app's server -> FastAPI
export class ServerApiClient {
  constructor(private baseUrl = process.env.API_BASE_URL!) {}

  async post<T>(endpoint: string, data: unknown, authToken?: string | null) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) headers.Authorization = `Bearer ${authToken}`; // omitted entirely for guest-allowed endpoints
    const res = await fetch(`${this.baseUrl}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(data) });
    const body = await res.json().catch(() => null);
    return { data: res.ok ? body : null, error: res.ok ? null : new Error(body?.error ?? res.statusText), status: res.status };
  }
}
export const serverApiClient = new ServerApiClient();
```

Auth never becomes application code beyond this: the browser holds an httpOnly cookie it can't read
and a readable CSRF cookie it echoes on unsafe methods; every route resolves the real token via
`extractBearerToken`.

---

## Path A: Endpoint Shared With Another Client

An example: a mobile app or partner integration also needs to submit a **quote request** — the same
write both the web storefront and that other client must go through.

```ts
// types/quote-requests.ts
export interface CreateQuoteRequest { unitId: string; destinationCountry: string; incoterm: 'FOB' | 'CFR' | 'CIF'; email: string; whatsapp?: string }
export interface QuoteRequest extends CreateQuoteRequest { id: string; status: 'pending' | 'quoted' | 'closed' }
```

```ts
// services/quote-requests/quote-requests.server.ts
import { serverApiClient } from '@/lib/server-api';

// authToken is nullable here specifically because this endpoint accepts guest
// submissions — most .server.ts functions in this app require a real token and
// should type it as `string`, not `string | null`. Treat this as the exception.
export async function submitQuoteRequestServer(data: CreateQuoteRequest, authToken: string | null) {
  const { data: quote, error } = await serverApiClient.post<QuoteRequest>('/quote-requests', data, authToken);
  if (error || !quote) throw error ?? new Error('No response data');
  return quote;
}
```

```ts
// app/api/v0/quote-requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { submitQuoteRequestServer } from '@/services/quote-requests/quote-requests.server';

const Schema = z.object({
  unitId: z.string().min(1), destinationCountry: z.string().length(2),
  incoterm: z.enum(['FOB', 'CFR', 'CIF']), email: z.string().email(), whatsapp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  // Guest-allowed: a quote request doesn't require an account, so a missing
  // token is not a 401 here — null is forwarded as-is and simply omits the
  // Authorization header (see serverApiClient.post above).
  const authToken = extractBearerToken(request);

  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message, error_code: 'VALIDATION_ERROR' }, { status: 400 });

  try {
    const quote = await submitQuoteRequestServer(parsed.data, authToken);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('POST /api/v0/quote-requests failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

```ts
// services/quote-requests/quote-requests.client.ts
import { nextjsApiClient } from '@/lib/nextjs-api';

export async function submitQuoteRequest(data: CreateQuoteRequest) {
  const { data: quote, error } = await nextjsApiClient.post<QuoteRequest>('/api/v0/quote-requests', data);
  if (error || !quote) throw error ?? new Error('Submit failed');
  return quote;
}
```

```ts
// hooks/queries/useQuoteRequests.ts
'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';
import { submitQuoteRequest } from '@/services/quote-requests';

export function useSubmitQuoteRequest(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitQuoteRequest,
    onSuccess: () => userId && qc.invalidateQueries({ queryKey: queryKeys.quoteRequests.list(userId) }),
  });
}
```

---

## Path B: Web-Only Mutation — Server Action (Less Code, Same Guarantees)

No client service, no route.ts. A Server Action runs on the server by construction, so it reads the
cookie directly and calls the server service in-process. This is the **internal staff admin**, not a
self-service dealer portal — one stock pool, staff-only:

```ts
// app/(app)/admin/stock/actions.ts
'use server';
import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';
import { z } from 'zod';
import { updateUnitServer } from '@/services/stock/stock.server';

const Schema = z.object({ price: z.number().positive() });

export async function updateUnitPrice(unitId: string, formData: FormData) {
  const parsed = Schema.safeParse({ price: Number(formData.get('price')) });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const authToken = (await cookies()).get('access_token')?.value;
  if (!authToken) return { error: 'Unauthorized' };

  const unit = await updateUnitServer(unitId, parsed.data, authToken);
  updateTag(`unit:${unit.slug}`); // public page picks up the change
  return { data: unit };
}
```

```tsx
// app/(app)/admin/stock/PriceForm.tsx
'use client';
import { useActionState } from 'react';
import { updateUnitPrice } from './actions';

export function PriceForm({ unitId }: { unitId: string }) {
  const [state, action, pending] = useActionState(
    (_prev: unknown, formData: FormData) => updateUnitPrice(unitId, formData),
    null,
  );
  return (
    <form action={action}>
      <input name="price" type="number" required />
      <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

Use React Query on top of a Server Action only if the same data also needs client-side caching
elsewhere (e.g. an optimistic list); for a single form, `useActionState` alone is enough state
management and ships less JS.

---

## Server Components: Skip Every Hop

```tsx
// app/(app)/admin/stock/[id]/page.tsx
import { cookies } from 'next/headers';
import { getUnitServer } from '@/services/stock/stock.server';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authToken = (await cookies()).get('access_token')?.value;
  if (!authToken) redirectToLogin();
  const unit = await getUnitServer(id, authToken);
  return <UnitAdminView unit={unit} />;
}
```

For a **public** page, wrap the same kind of call in `"use cache"` instead of leaving it dynamic —
see `RENDERING_AND_SEO_GUIDE.md`. For a logged-in **app** page that also needs the React Query cache
warm client-side, pair it with `prefetchQuery`/`dehydrate` — see `REACT_QUERY_GUIDE.md`.

---

## Status Codes

| Method | Success | | Error | Meaning |
|---|---|---|---|---|
| GET | 200 | | 400 | Zod validation failure |
| POST | 201 | | 401 | Missing/invalid/expired auth |
| PATCH/PUT | 200 | | 403 | Authenticated, not authorized |
| DELETE | 200/204 | | 404 | Not found |
| | | | 409 | Conflict — retried without an idempotency key |
| | | | 429 | Rate limited |

---

## Non-negotiables

- Zero manual token handling in feature code — the two `lib/` clients above own it entirely.
- Zod at every route/action boundary — no ad-hoc `if (!field)`.
- Log `error.message`, never the raw error/response object (it can carry the outgoing
  `Authorization` header).
- Machine-readable `error_code` on every error response.
- Idempotency key on any mutation a client-side retry could duplicate.
- Server Components and Server Actions call `.server.ts` directly — never their own `/api/v0` route
  over HTTP.
- A public page's data lives in `"use cache"`/PPR output, never the React Query cache.

---

*Last Updated: September 5, 2026 — Next.js 16 (Turbopack default, Cache Components), React 19, TanStack Query v5.*
