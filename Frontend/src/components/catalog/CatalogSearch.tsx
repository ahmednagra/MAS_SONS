import Link from 'next/link';
import type { StockFacets, UnitCategory } from '@/types/stock';

const GRADE_ORDER = ['5', '4.5', '4', '3.5', '3', 'R', 'RA'];
const STEERING_LABEL: Record<string, string> = { LHD: 'Left-hand drive', RHD: 'Right-hand drive' };

const field = 'mt-1.5 w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1';
const label = 'block text-[11px] font-semibold uppercase tracking-wide text-sub';

/**
 * Category landing search — everything on it is driven by /stock/facets?category=…,
 * so a tile or option only appears when at least one unit in stock matches it, with
 * its live count. A plain GET form to /stock: works before hydration and every search
 * is a shareable URL.
 */
export function CatalogSearch({ category, facets }: { category: UnitCategory; facets: StockFacets }) {
  const fmt = (n: number) => n.toLocaleString('en-US');
  const years: number[] = facets.year_min != null && facets.year_max != null
    ? Array.from({ length: facets.year_max - facets.year_min + 1 }, (_, i) => (facets.year_max as number) - i)
    : [];
  const grades = GRADE_ORDER.filter((g) => facets.grades.some((f) => f.value === g && f.count > 0));
  const bodyTypes = facets.body_types.filter((b) => b.count > 0);
  const priceStep = 500;
  const priceCeiling = facets.price_max != null ? Math.ceil(facets.price_max / priceStep) * priceStep : undefined;

  return (
    <section aria-labelledby="catalog-search-heading" className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="catalog-search-heading" className="text-lg font-semibold tracking-tight text-ink">
          Search {category === 'vehicle' ? 'vehicles' : 'equipment'}
        </h2>
        <p className="text-xs text-sub"><span className="font-semibold tabular-nums text-ink">{fmt(facets.total)}</span> in stock right now</p>
      </div>

      {bodyTypes.length > 0 && (
        <ul aria-label="Browse by body type" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {bodyTypes.map((b) => (
            <li key={b.value}>
              <Link
                href={`/stock?category=${category}&body_type=${encodeURIComponent(b.value)}`}
                className="flex items-baseline justify-between gap-2 rounded-sm border border-line bg-paper px-3.5 py-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <span>{b.value}</span>
                <span className="text-xs font-semibold tabular-nums text-sub">{fmt(b.count)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form action="/stock" method="get" className="mt-5 grid grid-cols-2 gap-3.5 border-t border-line pt-5 sm:grid-cols-4 lg:grid-cols-9">
        <input type="hidden" name="category" value={category} />

        <label className="col-span-2">
          <span className={label}>Make</span>
          <select name="make" className={field} defaultValue="">
            <option value="">Any make</option>
            {facets.makes.map((m) => (
              <option key={m.value} value={m.value}>{m.value} ({fmt(m.count)})</option>
            ))}
          </select>
        </label>

        <label className="col-span-2">
          <span className={label}>Model or keyword</span>
          <input name="keyword" type="text" placeholder="e.g. RDX, Hummer, hybrid" className={field} maxLength={80} />
        </label>

        <label>
          <span className={label}>Year from</span>
          <select name="year_min" className={field} defaultValue="">
            <option value="">Any</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>

        <label>
          <span className={label}>Year to</span>
          <select name="year_max" className={field} defaultValue="">
            <option value="">Any</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>

        <label className="col-span-2 sm:col-span-1">
          <span className={label}>Max price (USD)</span>
          <input
            name="price_max" type="number" min={0} step={priceStep} max={priceCeiling}
            placeholder={facets.price_min != null ? `from ${fmt(Math.round(facets.price_min))}` : 'Any'}
            className={field}
          />
        </label>

        <label className="col-span-2 sm:col-span-1">
          <span className={label}>Min grade</span>
          <select name="auction_grade_min" className={field} defaultValue="">
            <option value="">Any</option>
            {grades.map((g) => <option key={g} value={g}>{g} and up</option>)}
          </select>
        </label>

        {facets.steering_positions.length > 1 && (
          <label className="col-span-2 sm:col-span-1">
            <span className={label}>Steering</span>
            <select name="steering_position" className={field} defaultValue="">
              <option value="">Any</option>
              {facets.steering_positions.map((s) => (
                <option key={s.value} value={s.value}>{STEERING_LABEL[s.value] ?? s.value} ({fmt(s.count)})</option>
              ))}
            </select>
          </label>
        )}

        {facets.fuel_types.length > 1 && (
          <label className="col-span-2 sm:col-span-1">
            <span className={label}>Fuel</span>
            <select name="fuel_type" className={field} defaultValue="">
              <option value="">Any</option>
              {facets.fuel_types.map((f) => (
                <option key={f.value} value={f.value}>{f.value} ({fmt(f.count)})</option>
              ))}
            </select>
          </label>
        )}

        <div className="col-span-2 flex items-end justify-end gap-3 sm:col-span-4 lg:col-span-9 lg:col-start-1 lg:justify-between">
          <p className="hidden text-xs text-sub lg:block">
            {facets.year_min != null && facets.year_max != null && `${facets.year_min}–${facets.year_max} · `}
            {facets.price_min != null && facets.price_max != null && `$${fmt(Math.round(facets.price_min))} – $${fmt(Math.round(facets.price_max))} FOB`}
          </p>
          <button type="submit" className="rounded-sm bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">
            Search {fmt(facets.total)} units
          </button>
        </div>
      </form>
    </section>
  );
}
