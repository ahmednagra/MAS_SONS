import Link from 'next/link';
import { CatalogSearch } from '@/components/catalog/CatalogSearch';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import { Button } from '@/components/ui';
import type { StockFacets, UnitCategory, UnitSummary } from '@/types/stock';

export function CategoryLanding({
  category, eyebrow, title, description, facets, units,
}: {
  category: UnitCategory;
  eyebrow: string;
  title: string;
  description: string;
  facets: StockFacets;
  units: UnitSummary[];
}) {
  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:py-10">
      {/* Compact header: eyebrow + title on one line-block, description beside it on
          wide screens — the listings start within the first viewport. */}
      <header className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end lg:gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-sub">{eyebrow}</p>
          <h1 className="mt-1.5 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">{title}</h1>
        </div>
        <p className="text-sm leading-relaxed text-sub lg:text-right">{description}</p>
      </header>

      <CatalogSearch category={category} facets={facets} />

      <section aria-labelledby="current-stock-heading">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="current-stock-heading" className="text-2xl font-semibold tracking-tight text-ink">
            Current stock <span className="text-base font-medium tabular-nums text-sub">· {facets.total.toLocaleString('en-US')}</span>
          </h2>
          <Link href={`/stock?category=${category}`}><Button variant="secondary">Browse all →</Button></Link>
        </div>
        <ResultsGrid units={units} />
      </section>
    </main>
  );
}
