import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { CfLink } from './CfLink';
import type { Destination } from '@/types/destinations';
import type { UnitSummary } from '@/types/stock';

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export interface UnitCardProps {
  unit: UnitSummary;
  /** Preload the image — first cards are the LCP candidate on storefront pages. */
  priority?: boolean;
  /** Destination list for the C&F link; omit to render the plain "Get quote" action. */
  destinations?: Destination[];
  /** Epoch ms of "now" at render time (computed by the caller so cached renders stay pure). */
  nowMs?: number;
}

function statusTag(unit: UnitSummary, nowMs?: number): string | null {
  if (unit.status === 'sold') return 'Sold';
  if (unit.status === 'sourcing') return 'Sourcing';
  if (nowMs != null && nowMs - Date.parse(unit.created_at) < NEW_WINDOW_MS) return 'New';
  return null;
}

function Placeholder({ category }: { category: UnitSummary['category'] }) {
  const d = category === 'equipment'
    ? 'M6 34h20v-6H6v6Zm4-6V17h10v11M20 17l10-10 8 4-6 6-6 2M10 34a4 4 0 1 0 0 .01M22 34a4 4 0 1 0 0 .01'
    : 'M4 30h40v-7l-6-2-6-8H16l-6 8-6 2v7Zm8 0a4 4 0 1 0 0 .01M36 30a4 4 0 1 0 0 .01';
  return (
    <div className="flex h-full w-full items-center justify-center text-line">
      <svg aria-hidden viewBox="0 0 48 40" className="h-14 w-16 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </div>
  );
}

export function UnitCard({ unit, priority = false, destinations, nowMs }: UnitCardProps) {
  const usage = unit.category === 'vehicle'
    ? unit.mileage_km != null ? `${unit.mileage_km.toLocaleString('en-US')} km` : null
    : unit.operating_hours != null ? `${unit.operating_hours.toLocaleString('en-US')} hrs` : null;
  const spec = [usage, unit.transmission, unit.steering_position, unit.fuel_type].filter(Boolean);
  const tag = statusTag(unit, nowMs);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sm border border-line bg-surface transition-shadow hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)]">
      <div className="relative block aspect-[4/3] overflow-hidden bg-paper">
        <Link href={`/stock/${unit.slug}`} className="absolute inset-0 block">
          {unit.thumbnail_url ? (
            <SafeImage
              src={unit.thumbnail_url}
              alt={`${unit.year} ${unit.make} ${unit.model}`}
              fill
              sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 300px"
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              fallback={<Placeholder category={unit.category} />}
            />
          ) : (
            <Placeholder category={unit.category} />
          )}
          {/* Readable surface for the badges regardless of the photo. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute bottom-2.5 left-2.5 rounded-sm bg-white/95 px-2 py-1 font-mono text-[10.5px] font-medium tracking-wider text-[#1b2027]">
            Grade {unit.auction_grade}
          </span>
          {tag && (
            <span className="absolute bottom-2.5 right-2.5 rounded-sm bg-[#1b2027]/85 px-2 py-1 font-mono text-[10.5px] font-medium tracking-wider text-white">
              {tag}
            </span>
          )}
        </Link>
        <div className="absolute right-2.5 top-2.5 z-10">
          <FavoriteButton unitId={unit.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-[15px] font-medium leading-tight text-ink">
            <Link href={`/stock/${unit.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {unit.year} {unit.make} {unit.model}
            </Link>
          </h3>
          <p className="mt-1.5 font-mono text-[11px] tracking-wide text-sub">{spec.join(' · ') || unit.body_type}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="font-mono text-[1.15rem] font-semibold tabular-nums tracking-tight text-ink">${unit.price_usd.toLocaleString('en-US')}</p>
            <p className="font-mono text-[11px] text-sub">FOB {unit.port}</p>
          </div>
          <div className="relative z-10">
            {destinations ? (
              <CfLink unit={unit} destinations={destinations} />
            ) : (
              <span className="text-sm font-medium text-ink">Get quote →</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
