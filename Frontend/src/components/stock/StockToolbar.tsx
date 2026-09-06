'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';

import { SORT_OPTIONS, type SortKey } from '@/lib/stock-sort';

/** Sort select: rewrites the URL, dropping the cursor so a new order always starts at page one. */
export function SortSelect({ value, fixed }: { value: SortKey; fixed?: Record<string, string> }) {
  // Landings pass `fixed` and must not read the URL: useSearchParams would make a cached page dynamic (Next E1433).
  return fixed ? <SortControl value={value} base={new URLSearchParams(fixed)} /> : <SortFromUrl value={value} />;
}

function SortFromUrl({ value }: { value: SortKey }) {
  const params = useSearchParams();
  return <SortControl value={value} base={params} />;
}

function SortControl({ value, base }: { value: SortKey; base: URLSearchParams | ReturnType<typeof useSearchParams> }) {
  const router = useRouter();
  const change = (next: string) => {
    const q = new URLSearchParams(base);
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
