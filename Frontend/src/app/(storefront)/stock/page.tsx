import { Suspense } from 'react';
import Link from 'next/link';
import { searchStockServer } from '@/services/stock/stock.server';
import { StockFilters } from '@/components/stock/StockFilters';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import type { StockSearchParams } from '@/types/stock';

const PAGE_SIZE = 24;

type RawParams = Record<string, string | string[] | undefined>;

export default function StockPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10">
      <Suspense fallback={null}>
        <StockFilters />
      </Suspense>
      <Suspense fallback={<p className="text-sub">Loading stock…</p>}>
        <StockResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function StockResults({ searchParams }: { searchParams: Promise<RawParams> }) {
  const params = await searchParams;
  const cursor = params.cursor ? Number(params.cursor) : undefined;
  const query: StockSearchParams = {
    category: params.category === 'vehicle' || params.category === 'equipment' ? params.category : undefined,
    make: typeof params.make === 'string' ? params.make : undefined,
    model: typeof params.model === 'string' ? params.model : undefined,
    price_max: typeof params.price_max === 'string' ? Number(params.price_max) : undefined,
    steering_position: params.steering_position === 'LHD' || params.steering_position === 'RHD' ? params.steering_position : undefined,
    cursor,
    limit: PAGE_SIZE,
  };
  const { items, next_cursor } = await searchStockServer(query);
  const nextQuery = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === 'string'));

  return (
    <div className="flex flex-col gap-6">
      <ResultsGrid units={items} />
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
