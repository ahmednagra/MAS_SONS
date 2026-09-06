import Link from 'next/link';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { UnitCard } from './UnitCard';
import type { Destination } from '@/types/destinations';
import type { UnitSummary } from '@/types/stock';

/**
 * A titled row of cards. Horizontal snap-scroll on phones (most buyers arrive on
 * Android), a fixed grid from the tablet breakpoint up. Empty rails render nothing
 * rather than an empty heading.
 */
export function StockRail({
  title,
  eyebrow,
  description,
  href,
  units,
  destinations,
  nowMs,
  priorityCount = 0,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  href: string;
  units: UnitSummary[];
  destinations: Destination[];
  nowMs: number;
  priorityCount?: number;
}) {
  if (!units.length) return null;
  const id = `rail-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20" aria-labelledby={id}>
      <SectionHeader
        id={id}
        eyebrow={eyebrow}
        title={title}
        description={description}
        aside={<Link href={href} className="whitespace-nowrap underline-offset-4 hover:underline">View all →</Link>}
      />
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {units.map((unit, index) => (
          <li key={unit.id} className="w-[76vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <UnitCard unit={unit} priority={index < priorityCount} destinations={destinations} nowMs={nowMs} />
          </li>
        ))}
      </ul>
    </section>
  );
}
