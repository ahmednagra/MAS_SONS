import { UnitCard } from './UnitCard';
import type { Destination } from '@/types/destinations';
import type { UnitSummary } from '@/types/stock';

// First cards are the LCP candidate on storefront pages; preload them instead of lazy-loading.
const ABOVE_FOLD_COUNT = 2;

export function ResultsGrid({
  units,
  destinations,
  nowMs,
  dense = false,
}: {
  units: UnitSummary[];
  destinations?: Destination[];
  nowMs?: number;
  /** Four columns beside a sidebar on wide screens (stock page); landing pages keep auto-fill. */
  dense?: boolean;
}) {
  if (!units.length) return <p className="text-sub">No units match your search.</p>;
  return (
    <div className={dense ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4' : 'grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4'}>
      {units.map((unit, index) => (
        <UnitCard key={unit.id} unit={unit} priority={index < ABOVE_FOLD_COUNT} destinations={destinations} nowMs={nowMs} />
      ))}
    </div>
  );
}
