'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'year_desc', label: 'Year: newest first' },
  { value: 'mileage_asc', label: 'Mileage: lowest first' },
  { value: 'grade_desc', label: 'Grade: best first' },
] as const;
export type SortKey = (typeof SORT_OPTIONS)[number]['value'];
export const isSortKey = (v: unknown): v is SortKey => SORT_OPTIONS.some((o) => o.value === v);

/** Sort select: rewrites the URL, dropping the cursor so a new order always starts at page one. */
export function SortSelect({ value }: { value: SortKey }) {
  const router = useRouter();
  const params = useSearchParams();
  const change = (next: string) => {
    const q = new URLSearchParams(params);
    q.delete('cursor');
    q.delete('cursor_value');
    if (next === 'newest') q.delete('sort');
    else q.set('sort', next);
    const s = q.toString();
    router.push(s ? `/stock?${s}` : '/stock');
  };
  return (
    <label className="flex items-center gap-1.5 text-xs text-sub">
      <span className="hidden sm:inline">Sort</span>
      <select
        aria-label="Sort results"
        value={value}
        onChange={(e) => change(e.target.value)}
        className="rounded-sm border border-line bg-surface px-2 py-1 text-xs font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** Reads the site-wide port preference; "change" focuses the utility-bar picker instead of duplicating it. */
export function ShipToSummary({ destinations, pickerId }: { destinations: Destination[]; pickerId: string }) {
  const [code] = useDestinationPreference();
  const dest = code ? destinations.find((d) => d.country_code === code) : undefined;
  const focusPicker = () => {
    const el = document.getElementById(pickerId) as HTMLSelectElement | null;
    el?.scrollIntoView({ block: 'nearest' });
    el?.focus();
  };
  return (
    <p className="text-xs text-sub">
      {dest ? <>Quotes C&amp;F to <span className="font-medium text-ink">{dest.primary_port}</span></> : 'No port chosen · prices shown FOB'}
      {' · '}
      <button type="button" onClick={focusPicker} className="font-medium text-ink underline-offset-4 hover:underline">
        {dest ? 'change' : 'choose port'}
      </button>
    </p>
  );
}

/** Keyset pagination has no "previous" cursor; the browser history already holds the previous page. */
export function PreviousPageButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.back()} className="rounded-sm border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper">
      ← Previous
    </button>
  );
}
