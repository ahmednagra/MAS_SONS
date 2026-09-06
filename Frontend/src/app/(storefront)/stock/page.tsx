import { Suspense } from 'react';
import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { listDestinationsServer } from '@/services/destinations';
import { SHIP_TO_PICKER_ID } from '@/components/layout/DestinationPicker';
import { PreviousPageButton, ShipToSummary, SortSelect } from '@/components/stock/StockToolbar';
import { isSortKey } from '@/lib/stock-sort';
import { searchStockServer } from '@/services/stock/stock.server';
import { ActiveFilters } from '@/components/stock/ActiveFilters';
import { FilterPanel } from '@/components/ui';
import { FINDER_KEYS, facetParams, type FinderValues } from '@/lib/stock-filters';
import { getStockFacetsServer } from '@/services/stock/stock.server';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import type { StockSearchParams } from '@/types/stock';

const PAGE_SIZE = 24;

type RawParams = Record<string, string | string[] | undefined>;

// Facets for the filter panel, keyed by the current filters so the server-rendered counts
// match what the live cascade will show — refreshed with the stock tag, hourly backstop.
async function getFacets(params: StockSearchParams) {
  'use cache';
  cacheLife('hours');
  cacheTag('stock');
  return getStockFacetsServer(params);
}

// Ports for the picker and the cards' C&F links — reference data, cached for days.
async function getDestinations() {
  'use cache';
  cacheLife('days');
  cacheTag('destinations');
  try {
    return await listDestinationsServer();
  } catch {
    return [];
  }
}

export const metadata = {
  title: 'Stock — M.A.S & SONS',
  description: 'Every vehicle and machine we have in Japan right now, with auction grade, mileage, steering and an FOB price to the port shown.',
};

/**
 * Marketplace layout: sticky filter sidebar on wide screens, results beside it; on
 * phones the same panel sits behind a "Filters" toggle above the grid.
 */
export default function StockPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  return (
    <main id="top" className="mx-auto max-w-[1200px] px-4 py-6 sm:py-7">
      {/* One-row header so the filter panel and the first cards fit in the first screen. */}
      <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">In stock in Japan</h1>
        <p className="text-sm text-sub">Auction grade, mileage and steering on every card · FOB price at the Japanese port shown.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[272px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-[112px]">
          <Suspense fallback={<div className="h-12 rounded-sm border border-line bg-surface lg:h-[36rem]" aria-busy />}>
            <StockFinderPanel searchParams={searchParams} />
          </Suspense>
        </aside>
        <section aria-label="Results">
          <Suspense fallback={<p className="text-sub">Loading stock…</p>}>
            <StockResults searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </main>
  );
}

async function finderValues(searchParams: Promise<RawParams>): Promise<FinderValues> {
  const params = await searchParams;
  const values: FinderValues = {};
  for (const key of FINDER_KEYS) {
    const v = params[key];
    if (typeof v === 'string' && v) values[key] = v.slice(0, 80);
  }
  return values;
}

async function StockFinderPanel({ searchParams }: { searchParams: Promise<RawParams> }) {
  const values = await finderValues(searchParams);
  const facets = await getFacets(facetParams(values));
  // Keyed by the URL's filters: Clear (and every applied search) remounts the panel so its
  // local selection state matches the address bar instead of surviving the navigation.
  return <FilterPanel key={JSON.stringify(values)} facets={facets} values={values} layout="sidebar" />;
}

async function StockResults({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [params, destinations, values] = await Promise.all([searchParams, getDestinations(), finderValues(searchParams)]);
  const cursor = params.cursor ? Number(params.cursor) : undefined;
  const sort = isSortKey(params.sort) ? params.sort : 'newest';
  const str = (v: string | string[] | undefined) => (typeof v === 'string' && v !== '' ? v : undefined);
  const num = (v: string | string[] | undefined) => {
    const n = Number(str(v));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const grade = str(params.auction_grade_min);
  const query: StockSearchParams = {
    category: params.category === 'vehicle' || params.category === 'equipment' ? params.category : undefined,
    make: str(params.make),
    model: str(params.model),
    body_type: str(params.body_type),
    year_min: num(params.year_min),
    year_max: num(params.year_max),
    price_min: num(params.price_min),
    price_max: num(params.price_max),
    auction_grade_min: grade && ['5', '4.5', '4', '3.5', '3', 'R', 'RA'].includes(grade) ? (grade as StockSearchParams['auction_grade_min']) : undefined,
    steering_position: params.steering_position === 'LHD' || params.steering_position === 'RHD' ? params.steering_position : undefined,
    fuel_type: str(params.fuel_type),
    keyword: str(params.keyword),
    sort,
    cursor,
    cursor_value: str(params.cursor_value),
    limit: PAGE_SIZE,
  };
  const { items: fetched, next_cursor, next_cursor_value, total } = await searchStockServer(query);
  // In the default order, units without a photo sink to the end of the page so placeholders never
  // break the first rows; an explicit sort keeps the exact server order.
  const items = sort === 'newest' ? [...fetched].sort((a, b) => Number(!a.thumbnail_url) - Number(!b.thumbnail_url)) : fetched;
  const rangeLabel = items.length === 0
    ? 'No units match'
    : total != null ? `1–${items.length} of ${total.toLocaleString('en-US')}` : `${items.length} units${next_cursor != null ? ' · more below' : ''}`;
  const nextQuery = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === 'string'));

  return (
    <div className="flex flex-col gap-4">
      {/* Single toolbar row: result count and active filters left, port picker right. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sub">{rangeLabel}</p>
          <ActiveFilters values={values} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ShipToSummary destinations={destinations} pickerId={SHIP_TO_PICKER_ID} />
          <SortSelect value={sort} />
        </div>
      </div>
      <ResultsGrid units={items} destinations={destinations} dense />
      {(next_cursor != null || cursor != null) && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
          {cursor != null && <PreviousPageButton />}
          {next_cursor != null && (
            <Link
              href={(() => {
                nextQuery.set('cursor', String(next_cursor));
                if (next_cursor_value) nextQuery.set('cursor_value', next_cursor_value); else nextQuery.delete('cursor_value');
                return `/stock?${nextQuery.toString()}`;
              })()}
              className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
            >
              Next {PAGE_SIZE} →
            </Link>
          )}
          <a href="#top" className="ml-2 text-xs font-medium text-sub underline-offset-4 hover:text-ink hover:underline">Back to top</a>
        </nav>
      )}
    </div>
  );
}
