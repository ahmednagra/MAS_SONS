import Link from 'next/link';
import { SaveSearchButton } from '@/components/ui/SaveSearchButton';
import type { StockFacets } from '@/types/stock';

const GRADES = ['5', '4.5', '4', '3.5', '3'] as const;

const field = 'mt-1.5 w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1';
const label = 'block font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub';

export const FINDER_KEYS = [
  'category', 'make', 'model', 'body_type', 'year_min', 'year_max', 'price_min', 'price_max', 'steering_position', 'auction_grade_min',
] as const;
export type FinderKey = (typeof FINDER_KEYS)[number];
export type FinderValues = Partial<Record<FinderKey, string>>;

/**
 * Sidebar filter panel for the stock page — a plain GET form, so it works before
 * hydration and every search is a shareable URL. Always visible beside the results on
 * wide screens; on phones it sits behind a "Filters" toggle (pure CSS, no JS) and opens
 * automatically when any filter is active.
 */
export function StockFinder({ facets, yearNow, values = {} }: { facets: StockFacets; yearNow: number; values?: FinderValues }) {
  const years = Array.from({ length: 26 }, (_, i) => yearNow - i);
  const active = FINDER_KEYS.filter((k) => values[k]).length;

  return (
    <div>
      <input suppressHydrationWarning type="checkbox" id="stock-filters" defaultChecked={active > 0} className="peer sr-only" aria-controls="stock-filters-panel" />
      <label
        htmlFor="stock-filters"
        className="flex cursor-pointer items-center justify-between rounded-sm border border-line bg-surface px-4 py-3 text-sm font-medium text-ink lg:hidden"
      >
        <span>Filters{active > 0 && <span className="ml-1.5 font-mono text-[11px] text-sub">({active})</span>}</span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      </label>

      <form
        id="stock-filters-panel"
        action="/stock"
        method="get"
        className="mt-3 hidden rounded-sm border border-line bg-surface p-5 text-ink peer-checked:block lg:mt-0 lg:block"
      >
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-lg leading-none">Filters</h2>
          <p className="font-mono text-[11px] text-sub">
            <span className="font-medium text-ink">{facets.total.toLocaleString('en-US')}</span> in stock
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <label className="col-span-2 lg:col-span-1">
            <span className={label}>Category</span>
            <select suppressHydrationWarning name="category" className={field} defaultValue={values.category ?? ''}>
              <option value="">All ({facets.total.toLocaleString('en-US')})</option>
              <option value="vehicle">Vehicles ({facets.vehicles.toLocaleString('en-US')})</option>
              <option value="equipment">Heavy equipment ({facets.equipment.toLocaleString('en-US')})</option>
            </select>
          </label>
          <label className="col-span-2 lg:col-span-1">
            <span className={label}>Make</span>
            <select suppressHydrationWarning name="make" className={field} defaultValue={values.make ?? ''}>
              <option value="">Any make</option>
              {facets.makes.map((m) => (
                <option key={m.value} value={m.value}>{m.value} ({m.count})</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 lg:col-span-1">
            <span className={label}>Model</span>
            <input suppressHydrationWarning name="model" type="text" placeholder="e.g. HiAce" defaultValue={values.model ?? ''} className={field} />
          </label>
          <label className="col-span-2 lg:col-span-1">
            <span className={label}>Body type</span>
            <select suppressHydrationWarning name="body_type" className={field} defaultValue={values.body_type ?? ''}>
              <option value="">Any</option>
              {facets.body_types.map((b) => (
                <option key={b.value} value={b.value}>{b.value} ({b.count})</option>
              ))}
            </select>
          </label>

          <fieldset className="col-span-2 grid grid-cols-2 gap-3 lg:col-span-1">
            <legend className={label}>Year</legend>
            <select suppressHydrationWarning name="year_min" aria-label="Year from" className={field} defaultValue={values.year_min ?? ''}>
              <option value="">From</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select suppressHydrationWarning name="year_max" aria-label="Year to" className={field} defaultValue={values.year_max ?? ''}>
              <option value="">To</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </fieldset>

          <fieldset className="col-span-2 grid grid-cols-2 gap-3 lg:col-span-1">
            <legend className={label}>Price (USD)</legend>
            <input suppressHydrationWarning name="price_min" aria-label="Minimum price" type="number" min={0} step={500} placeholder="Min" defaultValue={values.price_min ?? ''} className={field} />
            <input suppressHydrationWarning name="price_max" aria-label="Maximum price" type="number" min={0} step={500} placeholder="Max" defaultValue={values.price_max ?? ''} className={field} />
          </fieldset>

          <label>
            <span className={label}>Steering</span>
            <select suppressHydrationWarning name="steering_position" className={field} defaultValue={values.steering_position ?? ''}>
              <option value="">Any</option>
              <option value="RHD">Right-hand drive</option>
              <option value="LHD">Left-hand drive</option>
            </select>
          </label>
          <label>
            <span className={label}>Min grade</span>
            <select suppressHydrationWarning name="auction_grade_min" className={field} defaultValue={values.auction_grade_min ?? ''}>
              <option value="">Any</option>
              {GRADES.map((g) => <option key={g} value={g}>{g} and up</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Link href="/stock" className="text-sm font-medium text-sub underline-offset-4 hover:text-ink hover:underline">Clear</Link>
          <button type="submit" className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">
            Apply filters
          </button>
        </div>
      </form>
    </div>
  );
}

const CHIP_LABEL: Record<FinderKey, string> = {
  category: 'Category',
  make: 'Make',
  model: 'Model',
  body_type: 'Body',
  year_min: 'From',
  year_max: 'To',
  price_min: 'Min $',
  price_max: 'Max $',
  steering_position: 'Steering',
  auction_grade_min: 'Grade ≥',
};

/** The current query as removable chips — each link is the same URL minus one filter. */
export function ActiveFilters({ values }: { values: FinderValues }) {
  const active = FINDER_KEYS.filter((k) => values[k]);
  if (!active.length) return null;
  const without = (key: FinderKey) => {
    const q = new URLSearchParams();
    for (const k of active) if (k !== key) q.set(k, values[k] as string);
    const s = q.toString();
    return s ? `/stock?${s}` : '/stock';
  };
  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {active.map((k) => (
        <li key={k}>
          <Link
            href={without(k)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-3 pr-2 text-xs text-ink hover:border-ink"
            aria-label={`Remove filter ${CHIP_LABEL[k]} ${values[k]}`}
          >
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-sub">{CHIP_LABEL[k]}</span>
            <span className="font-medium">{k === 'category' ? (values[k] === 'vehicle' ? 'Vehicles' : 'Equipment') : values[k]}</span>
            <span aria-hidden className="text-sub">×</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/stock" className="text-xs font-medium text-sub underline-offset-4 hover:text-ink hover:underline">Clear all</Link>
      </li>
      <li>
        <SaveSearchButton filters={Object.fromEntries(active.map((k) => [k, values[k] as string]))} />
      </li>
    </ul>
  );
}
