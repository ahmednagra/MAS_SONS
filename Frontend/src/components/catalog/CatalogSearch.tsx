import Link from 'next/link';
import type { StockFacets, UnitCategory } from '@/types/stock';

/** Quick body-type chips above the results; each is a deep link into the filtered stock list. */
export function CatalogSearch({ category, facets }: { category: UnitCategory; facets: StockFacets }) {
  const tiles = facets.body_types.filter((b) => b.count > 0);
  if (!tiles.length) return null;
  return (
    <ul aria-label="Browse by body type" className="flex flex-wrap gap-2">
      {tiles.map((b) => (
        <li key={b.value}>
          <Link
            href={`/stock?category=${category}&body_type=${encodeURIComponent(b.value)}`}
            className="inline-flex items-baseline gap-1.5 rounded-sm border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {b.value}
            <span className="font-mono text-[11px] tabular-nums text-sub">{b.count.toLocaleString('en-US')}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
