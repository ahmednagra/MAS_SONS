import Link from 'next/link';
import Image from 'next/image';
import type { Unit } from '@/types/stock';

export function ResultsGrid({ units }: { units: Unit[] }) {
  if (!units.length) return <p className="text-sub">No units match your search.</p>;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  const spec = unit.category === 'vehicle'
    ? [unit.mileage != null ? `${unit.mileage.toLocaleString('en-US')} km` : null, unit.steeringPosition].filter(Boolean)
    : [unit.hours != null ? `${unit.hours.toLocaleString('en-US')} hrs` : null].filter(Boolean);

  return (
    <Link
      href={`/stock/${unit.slug}`}
      className="group flex flex-col overflow-hidden rounded-sm border border-line bg-surface transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper">
        {unit.images[0] && (
          <Image
            src={unit.images[0].url}
            alt={`${unit.year} ${unit.make} ${unit.model}`}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute left-2.5 top-2.5 animate-[gradepulse_3.2s_ease-in-out_infinite] rounded-sm bg-ink/70 px-2 py-1 text-xs font-semibold tracking-wide text-paper">
          GRADE {unit.auctionGrade}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[15px] font-semibold leading-tight text-ink">
            {unit.year} {unit.make} {unit.model}
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sub">{spec.join(' · ')}</p>
        </div>
        <div className="mt-auto flex items-baseline justify-between border-t border-line pt-3">
          <div>
            <p className="tabular-nums text-lg font-semibold text-ink">${unit.price.toLocaleString('en-US')}</p>
            <p className="text-xs text-sub">FOB {unit.port}</p>
          </div>
          <span className="text-sm font-semibold text-accent">Get quote →</span>
        </div>
      </div>
    </Link>
  );
}
