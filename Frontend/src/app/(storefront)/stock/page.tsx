import { Suspense } from 'react';
import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { listDestinationsServer } from '@/services/destinations';
import { DestinationPicker } from '@/components/layout/DestinationPicker';
import { searchStockServer } from '@/services/stock/stock.server';
import { ActiveFilters, FINDER_KEYS, StockFinder, type FinderValues } from '@/components/stock/StockFinder';
import { PageHeader } from '@/components/layout/PageHeader';
import { getStockFacetsServer } from '@/services/stock/stock.server';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import type { StockSearchParams } from '@/types/stock';

const PAGE_SIZE = 24;

type RawParams = Record<string, string | string[] | undefined>;

// Facets for the filter panel — refreshed with the stock tag, hourly backstop.
async function getFacets() {
  'use cache';
  cacheLife('hours');
  cacheTag('stock');
  return getStockFacetsServer();
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
    <main className="mx-auto max-w-[1200px] px-4 py-10">
      <PageHeader eyebrow="Stock" title="In stock in Japan" description="Auction grade, mileage and steering on every card. Prices are FOB the Japanese port shown; pick your port for a C&F quote." />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-[88px]">
          <Suspense fallback={<div className="h-12 rounded-sm border border-line bg-surface lg:h-[36rem]" aria-busy />}>
            <StockFinderPanel searchParams={searchParams} />
          </Suspense>
        </aside>
        <section aria-label="Results" className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Suspense fallback={null}>
              <StockActiveFilters searchParams={searchParams} />
            </Suspense>
            <Suspense fallback={null}>
              <StockDestinationPicker />
            </Suspense>
          </div>
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
  const [values, facets] = await Promise.all([finderValues(searchParams), getFacets()]);
  // Dynamic render (searchParams awaited above), so reading the clock here is fine.
  return <StockFinder facets={facets} yearNow={new Date().getFullYear()} values={values} />;
}

async function StockActiveFilters({ searchParams }: { searchParams: Promise<RawParams> }) {
  const values = await finderValues(searchParams);
  // Keep the row's height stable so the picker does not jump when no filters are set.
  return <div className="min-h-[1.75rem]"><ActiveFilters values={values} /></div>;
}

async function StockDestinationPicker() {
  const destinations = await getDestinations();
  return <DestinationPicker destinations={destinations} />;
}

async function StockResults({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [params, destinations] = await Promise.all([searchParams, getDestinations()]);
  const cursor = params.cursor ? Number(params.cursor) : undefined;
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
    cursor,
    limit: PAGE_SIZE,
  };
  const { items, next_cursor } = await searchStockServer(query);
  const nextQuery = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === 'string'));

  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
        {items.length === 0 ? 'No units match' : `Showing ${items.length} unit${items.length === 1 ? '' : 's'}${next_cursor != null ? ' · more below' : ''}`}
      </p>
      <ResultsGrid units={items} destinations={destinations} />
      {next_cursor != null && (
        <nav className="flex justify-center">
          <Link
            href={(() => { nextQuery.set('cursor', String(next_cursor)); return `/stock?${nextQuery.toString()}`; })()}
            className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  );
}
