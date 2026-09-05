# React Query (TanStack Query v5) Guide

For app-like surfaces: quote requests, buyer accounts (favorites, saved searches, order status), and
the internal staff admin (managing stock, inquiries). **Not for public stock/search/detail pages** —
those are server-rendered under Cache Components; see `RENDERING_AND_SEO_GUIDE.md`.

---

## Where React Query Belongs

| | Public stock/search/detail | App surfaces (buyer account, staff admin) |
|---|---|---|
| Priority | SEO, LCP, crawlability | Interactivity, freshness |
| Rendering | Server Components, `"use cache"` + PPR | Client Components |
| Data | Direct `.server.ts` call, no client fetch | React Query hooks over `/api/v0/*` |

A page that needs to rank in search does not get a client-side spinner while data loads — the
content is in the initial HTML. React Query starts at the interactive layer on top of that (a
favorite-toggle, a quote-request form) and in the staff admin, never at a page's core content.

---

## New Hook Checklist

- Query keys from a central `queryKeys` factory — never an inline array literal.
- `staleTime`/`gcTime` from tier constants — never a bare number inlined in a hook.
- Cacheable data goes through `useQuery`/`useInfiniteQuery`, even inside an orchestration hook that
  also owns UI state — never hand-rolled `useState`+`useEffect`+`fetch`.
- User-sensitive keys include that identity — never rely on closure alone.
- Mutations invalidate the narrowest key (`.detail(id)`, `.list(params)`) — never a resource's `.all`.
- `select` narrows a payload for a component that needs a slice, instead of `useMemo` filtering the
  full result on every render.
- `refetchInterval` only as an explicit fallback behind a realtime channel (e.g. shipment-status
  updates), or for data genuinely outside that architecture — never as the default freshness
  mechanism.
- `queryOptions()` for any query used from more than one place (hook + `prefetchQuery` +
  `useSuspenseQuery`).
- One charting/icon/date library, chosen once — audit what's installed before adding a second.
- Heavy, occasional libraries (PDF quote export, spreadsheet export) are `dynamic import()`-ed at the
  call site.
- `'use client'` boundaries stay small — every KB here competes with LCP/INP directly.
- Large/unbounded query results paginate or virtualize — never fetch the plan's max page size and
  `.map()` it.
- Filter/search state lives in the URL (`useSearchParams`/`nuqs`), not only component state.

---

## Setup

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

```ts
// lib/react-query/query-client.ts
import { QueryClient, DefaultOptions } from '@tanstack/react-query';

export const STALE_TIMES = {
  STATIC: 30 * 60_000,
  SEMI_DYNAMIC: 5 * 60_000,
  DYNAMIC: 60_000,
  REALTIME: 0,
  INFINITE: Infinity,
} as const;

export const GC_TIMES = { SHORT: 5 * 60_000, MEDIUM: 30 * 60_000, LONG: 60 * 60_000, INFINITE: Infinity } as const;

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
    networkMode: 'online',
  },
  mutations: { retry: 1, networkMode: 'online' },
};

export const createQueryClient = () => new QueryClient({ defaultOptions });

let browserClient: QueryClient | undefined;
export function getQueryClient() {
  if (typeof window === 'undefined') return createQueryClient();
  return (browserClient ??= createQueryClient());
}
```

```ts
// lib/react-query/query-keys.ts
export const queryKeys = {
  favorites: {
    all: ['favorites'] as const,
    list: (userId: string) => [...queryKeys.favorites.all, 'list', userId] as const,
  },
  savedSearches: {
    all: ['saved-searches'] as const,
    list: (userId: string) => [...queryKeys.savedSearches.all, 'list', userId] as const,
  },
  quoteRequests: {
    all: ['quote-requests'] as const,
    list: (userId: string) => [...queryKeys.quoteRequests.all, 'list', userId] as const,
    detail: (id: string) => [...queryKeys.quoteRequests.all, 'detail', id] as const,
  },
  // Internal staff admin — this business has one stock pool, not per-dealer inventories.
  stock: {
    all: ['stock'] as const,
    list: (params: Record<string, unknown>) => [...queryKeys.stock.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.stock.all, 'detail', id] as const,
  },
  inquiries: {
    all: ['inquiries'] as const,
    unreadCount: () => [...queryKeys.inquiries.all, 'unread-count'] as const,
  },
} as const;
```

```tsx
// providers/QueryProvider.tsx
'use client';
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/lib/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(createQueryClient);
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

---

## The Core Conversion Flow: Requesting a Quote

This is the business's primary action — more central than favoriting, and worth getting right first.

```ts
// hooks/queries/useQuoteRequests.ts
import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getQuoteRequests, submitQuoteRequest } from '@/services/quote-requests';

export const quoteRequestsOptions = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.quoteRequests.list(userId),
    queryFn: () => getQuoteRequests(userId),
    enabled: !!userId,
    staleTime: STALE_TIMES.DYNAMIC, // a buyer checking status wants this fresh
    gcTime: GC_TIMES.MEDIUM,
  });

export const useQuoteRequests = (userId: string) => useQuery(quoteRequestsOptions(userId));

export function useSubmitQuoteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitQuoteRequest, // { unitId, destinationCountry, incoterm, contactMethod }
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.quoteRequests.list(variables.userId) });
    },
  });
}
```

No login is required to *submit* a quote request — `submitQuoteRequest` accepts a guest contact
(email/WhatsApp), and the mutation works with or without a `userId`. Requiring an account here would
cost real leads for no benefit.

---

## Favoriting (Optimistic — Latency-Sensitive)

```ts
// hooks/queries/useFavorites.ts
export function useToggleFavorite(userId: string) {
  const qc = useQueryClient();
  const key = queryKeys.favorites.list(userId);

  return useMutation({
    mutationFn: ({ unitId, isFavorited }: { unitId: string; isFavorited: boolean }) =>
      isFavorited ? removeFavorite(unitId) : addFavorite(unitId),
    onMutate: async ({ unitId, isFavorited }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<string[]>(key);
      qc.setQueryData<string[]>(key, (old = []) =>
        isFavorited ? old.filter((id) => id !== unitId) : [...old, unitId],
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(key, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
```

Every optimistic mutation needs `onMutate`/`onError`/`onSettled` — skipping rollback is what turns
"optimistic" into "wrong until the next refetch." A quote request, by contrast, is deliberately
**not** optimistic — the buyer needs real server confirmation that the request was received, not an
assumed-success UI.

---

## Internal Staff Admin: Managing Stock

One stock pool, not per-dealer inventories — a staff member updates a unit, the change invalidates
the narrowest key:

```ts
// hooks/queries/useStock.ts
export const stockListOptions = (params: Record<string, unknown>) =>
  queryOptions({
    queryKey: queryKeys.stock.list(params),
    queryFn: () => getStockList(params),
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export const useStockList = (params: Record<string, unknown>) => useQuery(stockListOptions(params));

export function useUpdateStock(unitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStockInput) => updateStock(unitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stock.detail(unitId) }),
  });
}
```

---

## Suspense Queries

Fits a region that only needs loading-vs-loaded (a modal, a detail panel) — not a default
replacement for `useQuery`, since a bare Suspense fallback collapses `loading`/`empty`/`error`/`stale`
into one spinner.

```tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { getQuoteRequestDetail } from '@/services/quote-requests';

const quoteDetailOptions = (id: string) =>
  queryOptions({ queryKey: queryKeys.quoteRequests.detail(id), queryFn: () => getQuoteRequestDetail(id) });

function QuoteDetailContent({ id }: { id: string }) {
  const { data } = useSuspenseQuery(quoteDetailOptions(id));
  return <QuoteDetailView quote={data} />;
}

export const QuoteDetailPanel = ({ id }: { id: string }) => (
  <ErrorBoundary fallback={<ErrorMessage />}>
    <Suspense fallback={<QuoteDetailSkeleton />}>
      <QuoteDetailContent id={id} />
    </Suspense>
  </ErrorBoundary>
);
```

---

## SSR Prefetch for App Pages

Different mechanism from PPR: this warms the React Query cache for a client-rendered app page, not
the static HTML of a public one.

```tsx
// app/(app)/admin/stock/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { stockListOptions } from '@/hooks/queries/useStock';

export default async function AdminStockPage() {
  const qc = getQueryClient();
  await qc.prefetchQuery(stockListOptions({}));
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <StockTable />
    </HydrationBoundary>
  );
}
```

---

## Summary

- Query keys and stale/GC tiers from constants, never inline.
- Narrow invalidation, never `.all`.
- The quote-request flow works for guests — don't gate the business's primary conversion action
  behind an account.
- Optimistic mutations (favoriting) get the full rollback contract; the quote-request mutation
  deliberately doesn't pretend success before the server confirms it.
- Search/filter state in the URL.
- No React Query on the critical path of an SEO page; no polling where realtime already covers it;
  no unbounded fetches.
