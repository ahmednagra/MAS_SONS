'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStockFacets } from '@/hooks/queries';
import { FINDER_KEYS, facetParams, type FinderKey, type FinderValues } from '@/lib/stock-filters';
import type { StockFacets, UnitCategory } from '@/types/stock';

const GRADES = ['5', '4.5', '4', '3.5', '3'] as const;

const field = 'mt-1 w-full rounded-sm border border-line bg-surface px-2.5 py-1.5 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1';
const label = 'block font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub';

export interface FilterPanelProps {
  /** Server-rendered facets for the initial values; the live cascade takes over after any change. */
  facets: StockFacets;
  values?: FinderValues;
  /** `sidebar`: stacked, sticky-friendly (stock page). `inline`: one wide row (category landings). */
  layout?: 'sidebar' | 'inline';
  /** Landing pages fix the category; it is submitted as a hidden field and the picker is hidden. */
  lockedCategory?: UnitCategory;
  /** Where the GET form submits; every search stays a shareable URL. */
  action?: string;
  /** Fallback year list when the facets carry no year range. */
  yearNow?: number;
  /** Inline layout only: body-type tiles above the fields that set the body-type filter. */
  bodyTypeTiles?: boolean;
}

/**
 * The one search/filter panel for the catalog. A plain GET form, so it works before
 * hydration; option counts cascade live from the current selection through the facets
 * endpoint; the submit button always says how many units the selection matches.
 */
export function FilterPanel({ facets: initialFacets, values: initialValues = {}, layout = 'sidebar', lockedCategory, action = '/stock', yearNow, bodyTypeTiles = false }: FilterPanelProps) {
  const [values, setValues] = useState<FinderValues>(() => (lockedCategory ? { ...initialValues, category: lockedCategory } : initialValues));
  const params = useMemo(() => facetParams(values), [values]);
  const initialParams = useMemo(() => facetParams(lockedCategory ? { ...initialValues, category: lockedCategory } : initialValues), [initialValues, lockedCategory]);
  const sameAsInitial = JSON.stringify(params) === JSON.stringify(initialParams);
  const { data, isFetching } = useStockFacets(params, sameAsInitial ? initialFacets : undefined);
  const facets = data ?? initialFacets;

  const years = facets.year_min != null && facets.year_max != null
    ? Array.from({ length: facets.year_max - facets.year_min + 1 }, (_, i) => (facets.year_max as number) - i)
    : Array.from({ length: 26 }, (_, i) => (yearNow ?? 2026) - i);
  const active = FINDER_KEYS.filter((k) => values[k] && !(k === 'category' && lockedCategory)).length;
  const set = (key: FinderKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const fmt = (n: number) => n.toLocaleString('en-US');
  // Keep the chosen value selectable even when the cascade drops it to zero matches.
  const options = (list: Array<{ value: string; count: number }>, chosen?: string) =>
    list.filter((o) => o.count > 0 || o.value === chosen);

  const inline = layout === 'inline';
  // Inline: two even rows of five slots on wide screens (make, model, body, year, price / steering+grade, fuel, range note, button).
  const cell = inline ? 'col-span-2 sm:col-span-2 lg:col-span-2' : 'col-span-2 lg:col-span-1';
  const grid = inline
    ? 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-10'
    : 'grid grid-cols-2 gap-2.5 lg:min-h-0 lg:grid-cols-1 lg:overflow-y-auto lg:pr-1';
  const setBody = (value: string) => setValues((v) => ({ ...v, body_type: v.body_type === value ? '' : value }));
  const tiles = inline && bodyTypeTiles && (
    <ul aria-label="Browse by body type" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options(initialFacets.body_types, values.body_type).map((b) => {
        const selected = values.body_type === b.value;
        const live = facets.body_types.find((f) => f.value === b.value)?.count ?? 0;
        return (
          <li key={b.value}>
            <button
              type="button"
              onClick={() => setBody(b.value)}
              aria-pressed={selected}
              className={`flex w-full items-baseline justify-between gap-2 rounded-sm border px-3.5 py-2.5 text-sm font-medium transition-colors ${selected ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-surface text-ink hover:border-accent hover:text-accent'}`}
            >
              <span>{b.value}</span>
              <span className="font-mono text-[11px] tabular-nums text-sub">{fmt(selected ? facets.total : live)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const fields = (
    <div className={grid}>
      {lockedCategory ? (
        <input type="hidden" name="category" value={lockedCategory} />
      ) : (
        <label className={cell}>
          <span className={label}>Category</span>
          <select name="category" className={field} value={values.category ?? ''} onChange={set('category')}>
            <option value="">All ({fmt(facets.vehicles + facets.equipment)})</option>
            <option value="vehicle">Vehicles ({fmt(facets.vehicles)})</option>
            <option value="equipment">Heavy equipment ({fmt(facets.equipment)})</option>
          </select>
        </label>
      )}
      <label className={cell}>
        <span className={label}>Make</span>
        <select name="make" className={field} value={values.make ?? ''} onChange={set('make')}>
          <option value="">Any make</option>
          {options(facets.makes, values.make).map((m) => (
            <option key={m.value} value={m.value}>{m.value} ({fmt(m.count)})</option>
          ))}
        </select>
      </label>
      <label className={cell}>
        <span className={label}>Model</span>
        <input name="model" type="text" placeholder={lockedCategory === 'equipment' ? 'e.g. PC200' : 'e.g. HiAce'} value={values.model ?? ''} onChange={set('model')} className={field} />
      </label>
      <label className={cell}>
        <span className={label}>{lockedCategory === 'equipment' ? 'Type' : 'Body type'}</span>
        <select name="body_type" className={field} value={values.body_type ?? ''} onChange={set('body_type')}>
          <option value="">Any</option>
          {options(facets.body_types, values.body_type).map((b) => (
            <option key={b.value} value={b.value}>{b.value} ({fmt(b.count)})</option>
          ))}
        </select>
      </label>

      <fieldset className={`grid grid-cols-2 gap-2.5 ${inline ? 'col-span-2 sm:col-span-2 lg:col-span-2' : 'col-span-2 lg:col-span-1'}`}>
        <legend className={label}>Year</legend>
        <select name="year_min" aria-label="Year from" className={field} value={values.year_min ?? ''} onChange={set('year_min')}>
          <option value="">From</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select name="year_max" aria-label="Year to" className={field} value={values.year_max ?? ''} onChange={set('year_max')}>
          <option value="">To</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </fieldset>

      <fieldset className={`grid grid-cols-2 gap-2.5 ${inline ? 'col-span-2 sm:col-span-2 lg:col-span-2' : 'col-span-2 lg:col-span-1'}`}>
        <legend className={label}>Price (USD)</legend>
        <input name="price_min" aria-label="Minimum price" type="number" min={0} step={500} placeholder="Min" value={values.price_min ?? ''} onChange={set('price_min')} className={field} />
        <input name="price_max" aria-label="Maximum price" type="number" min={0} step={500} placeholder="Max" value={values.price_max ?? ''} onChange={set('price_max')} className={field} />
      </fieldset>

      <div className={`grid grid-cols-2 gap-2.5 ${inline ? 'col-span-2 sm:col-span-2 lg:col-span-2' : 'col-span-2 lg:col-span-1'}`}>
        <label>
          <span className={label}>Steering</span>
          <select name="steering_position" className={field} value={values.steering_position ?? ''} onChange={set('steering_position')}>
            <option value="">Any</option>
            {options(facets.steering_positions, values.steering_position).map((s) => (
              <option key={s.value} value={s.value}>{s.value === 'RHD' ? 'Right-hand' : 'Left-hand'} ({fmt(s.count)})</option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>Min grade</span>
          <select name="auction_grade_min" className={field} value={values.auction_grade_min ?? ''} onChange={set('auction_grade_min')}>
            <option value="">Any</option>
            {GRADES.map((g) => <option key={g} value={g}>{g} and up</option>)}
          </select>
        </label>
      </div>

      <label className={cell}>
        <span className={label}>Fuel</span>
        <select name="fuel_type" className={field} value={values.fuel_type ?? ''} onChange={set('fuel_type')}>
          <option value="">Any</option>
          {options(facets.fuel_types, values.fuel_type).map((f) => (
            <option key={f.value} value={f.value}>{f.value} ({fmt(f.count)})</option>
          ))}
        </select>
      </label>
      {inline && (
        <div className="col-span-2 flex items-end justify-between gap-3 sm:col-span-4 lg:col-span-6">
          <p className="text-xs text-sub">
            {facets.year_min != null && facets.year_max != null && `${facets.year_min}–${facets.year_max} · `}
            {facets.price_min != null && facets.price_max != null && `$${fmt(Math.round(facets.price_min))} – $${fmt(Math.round(facets.price_max))} FOB`}
            {active > 0 && <> · <Link href={action + (lockedCategory ? `?category=${lockedCategory}` : '')} className="font-medium text-ink underline-offset-4 hover:underline">Clear</Link></>}
          </p>
          <button
            type="submit"
            disabled={facets.total === 0}
            className="rounded-sm bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {facets.total === 0 ? 'No matches' : `Show ${fmt(facets.total)} units`}
          </button>
        </div>
      )}
    </div>
  );

  const actions = (
    <div className="sticky bottom-0 mt-4 flex items-center justify-between gap-3 border-t border-line bg-surface pt-3 pb-1 lg:static lg:bg-transparent lg:pb-0">
      <Link href={action} className="text-sm font-medium text-sub underline-offset-4 hover:text-ink hover:underline">Clear</Link>
      <button
        type="submit"
        disabled={facets.total === 0}
        className="rounded-sm bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {facets.total === 0 ? 'No matches' : `Show ${fmt(facets.total)} units`}
      </button>
    </div>
  );

  if (inline) {
    return (
      <form action={action} method="get" className="text-ink">
        {tiles}
        {fields}
      </form>
    );
  }

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
        action={action}
        method="get"
        className="mt-3 hidden rounded-sm border border-line bg-surface p-4 text-ink peer-checked:block lg:mt-0 lg:flex lg:max-h-[calc(100vh-128px)] lg:flex-col lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:pr-2"
      >
        <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <h2 className="font-display text-lg leading-none">Filters</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sub" aria-live="polite">
            <span className="text-ink">{fmt(facets.total)}</span> match{isFetching && <span aria-hidden> …</span>}
          </p>
        </div>
        {fields}
        {actions}
      </form>
    </div>
  );
}
