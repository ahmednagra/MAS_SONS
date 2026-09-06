import Link from 'next/link';
import { SaveSearchButton } from '@/components/ui/SaveSearchButton';
import { FINDER_KEYS, type FinderKey, type FinderValues } from '@/lib/stock-filters';

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
  fuel_type: 'Fuel',
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
