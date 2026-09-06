import Link from 'next/link';
import { CatalogSearch } from '@/components/catalog/CatalogSearch';
import { SHIP_TO_PICKER_ID } from '@/components/layout/DestinationPicker';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import { ShipToSummary, SortSelect } from '@/components/stock/StockToolbar';
import { FilterPanel } from '@/components/ui';
import type { Destination } from '@/types/destinations';
import type { StockFacets, UnitCategory, UnitSummary } from '@/types/stock';

/** Builds a truthful heading from what is actually in stock, e.g. "SUVs, pickups, sedans and more". */
export function headingFromFacets(facets: StockFacets, fallback: string): string {
  const plural = (v: string) => {
    const w = v.replace(/^Pickup Truck$/i, 'pickup').toLowerCase();
    return w.endsWith('s') ? w : /^[A-Z]{2,}$/.test(v) ? `${v}s` : `${w}s`;
  };
  const top = facets.body_types.filter((b) => b.count > 0).slice(0, 3).map((b) => plural(b.value));
  if (top.length < 2) return fallback;
  return `${top.slice(0, -1).join(', ')}, ${top[top.length - 1]} and more`;
}

/** Category landing: the stock page layout (sticky filter sidebar + results) with the category fixed. */
export function CategoryLanding({
  category, eyebrow, title, description, facets, units, destinations = [],
}: {
  category: UnitCategory;
  eyebrow: string;
  title: string;
  description: string;
  facets: StockFacets;
  units: UnitSummary[];
  destinations?: Destination[];
}) {
  const noun = category === 'vehicle' ? 'vehicles' : 'equipment';
  // Same rule as the stock page: photo-less units sink to the end of the sample.
  const sample = [...units].sort((a, b) => Number(!a.thumbnail_url) - Number(!b.thumbnail_url));
  const total = facets.total;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:py-7">
      <header className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="w-full text-xs font-semibold uppercase tracking-wider text-sub">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">{title}</h1>
        <p className="text-sm text-sub">{description}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[272px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-[112px]">
          <FilterPanel facets={facets} layout="sidebar" lockedCategory={category} />
        </aside>

        <section aria-label="Results" className="flex flex-col gap-4">
          <CatalogSearch category={category} facets={facets} />
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line pb-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
              {sample.length === 0 ? `No ${noun} in stock` : `1–${sample.length} of ${total.toLocaleString('en-US')}`}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <ShipToSummary destinations={destinations} pickerId={SHIP_TO_PICKER_ID} />
              <SortSelect value="newest" fixed={{ category }} />
            </div>
          </div>
          <ResultsGrid units={sample} destinations={destinations} dense />
          {total > sample.length && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
              <Link href={`/stock?category=${category}`} className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper">
                See all {total.toLocaleString('en-US')} {noun} →
              </Link>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
