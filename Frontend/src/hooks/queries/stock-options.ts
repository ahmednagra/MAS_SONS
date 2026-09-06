// Deliberately NOT 'use client' — a plain queryOptions() factory has no client-only API
// usage, and the admin stock list page (a Server Component) needs to call it directly for
// SSR prefetch (docs/REACT_QUERY_GUIDE.md's "SSR Prefetch for App Pages" pattern). Keeping
// it in the same file as useStockList's 'use client' directive would taint this export too.
import { queryOptions } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getStockFacets, getStockList } from '@/services/stock';
import type { StockFacets, StockSearchParams } from '@/types/stock';

export const stockListOptions = (params: StockSearchParams) =>
  queryOptions({
    queryKey: queryKeys.stock.list(params),
    queryFn: () => getStockList(params),
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

/** Cascaded option counts for the filter panel; `initialData` is the server-rendered facets for the initial filters. */
export const stockFacetsOptions = (params: StockSearchParams, initialData?: StockFacets) =>
  queryOptions({
    queryKey: queryKeys.stock.facets(params),
    queryFn: () => getStockFacets(params),
    // Server-rendered facets act as placeholder rather than initialData: initialData stamps
    // Date.now() during SSR, which Next flags on prerendered pages (E1434).
    enabled: initialData === undefined,
    placeholderData: (prev) => prev ?? initialData,
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });
