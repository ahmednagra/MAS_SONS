import { Suspense } from 'react';
import { searchStockServer } from '@/services/stock/stock.server';
import { StockFilters } from '@/components/stock/StockFilters';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import { Pagination } from '@/components/ui';
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
  const page = Math.max(1, Number(params.page) || 1);
  const query: StockSearchParams = {
    make: typeof params.make === 'string' ? params.make : undefined,
    model: typeof params.model === 'string' ? params.model : undefined,
    steeringPosition: params.steeringPosition === 'LHD' || params.steeringPosition === 'RHD' ? params.steeringPosition : undefined,
    page,
    limit: PAGE_SIZE,
  };
  const { items, total } = await searchStockServer(query);
  const nextQuery = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => typeof e[1] === 'string'));

  return (
    <div className="flex flex-col gap-6">
      <ResultsGrid units={items} />
      <Pagination
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        hrefForPage={(p) => { nextQuery.set('page', String(p)); return `/stock?${nextQuery.toString()}`; }}
      />
    </div>
  );
}
