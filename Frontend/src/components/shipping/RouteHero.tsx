'use client';
import Link from 'next/link';
import { SHIP_TO_PICKER_ID } from '@/components/layout/DestinationPicker';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';

const MODE_LABEL: Record<string, string> = { roro: 'RoRo', container: 'Container', both: 'RoRo or container' };
export const PREP_DAYS = 10;

/** The buyer's own route, read from the site-wide port preference, with the three-stage timeline in real days. */
export function RouteHero({ destinations }: { destinations: Destination[] }) {
  const [code] = useDestinationPreference();
  const dest = (code && destinations.find((d) => d.country_code === code)) || destinations[0];
  if (!dest) return null;
  const transit = dest.estimated_transit_days;
  const focusPicker = () => {
    const el = document.getElementById(SHIP_TO_PICKER_ID) as HTMLSelectElement | null;
    el?.scrollIntoView({ block: 'nearest' });
    el?.focus();
  };
  const stages = [
    { title: 'Deposit & export preparation', days: `≈ ${PREP_DAYS} days`, note: 'De-registration, export inspection, booking on the next sailing.' },
    { title: `Sailing to ${dest.primary_port}`, days: transit != null ? `≈ ${transit} days` : 'per schedule', note: `${MODE_LABEL[dest.shipping_mode ?? 'both']} from ${dest.origin_port}.` },
    { title: 'Clearance at your port', days: 'your agent', note: 'Bill of lading, invoice and export certificate released once the balance is paid.' },
  ];

  return (
    <section aria-labelledby="route-heading" className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="route-heading" className="text-lg font-semibold tracking-tight text-ink">
          {dest.origin_port}, Japan → {dest.primary_port}, {dest.country_name}
          <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
            {transit != null ? `≈${transit} days` : 'transit on request'} · {MODE_LABEL[dest.shipping_mode ?? 'both']}
          </span>
        </h2>
        <p className="text-xs text-sub">
          Not your port? <button type="button" onClick={focusPicker} className="font-medium text-ink underline-offset-4 hover:underline">Change it</button>
        </p>
      </div>

      <svg viewBox="0 0 900 70" className="mt-4 w-full" role="img" aria-label={`Route from ${dest.origin_port} to ${dest.primary_port}`}>
        <path d="M30 50 Q450 -20 870 50" fill="none" stroke="var(--color-line)" strokeWidth="2" />
        <path d="M30 50 Q450 -20 870 50" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 6" style={{ animation: 'dash 1.6s linear infinite' }} />
        <circle cx="30" cy="50" r="6" fill="var(--color-accent)" />
        <circle cx="870" cy="50" r="6" fill="var(--color-ink)" />
        <text x="30" y="68" textAnchor="start" fontSize="11" fontWeight="600" fill="var(--color-ink)">{dest.origin_port}</text>
        <text x="870" y="68" textAnchor="end" fontSize="11" fontWeight="600" fill="var(--color-ink)">{dest.primary_port}</text>
      </svg>

      <ol className="mt-5 grid gap-4 sm:grid-cols-3">
        {stages.map((s, i) => (
          <li key={s.title} className="border-t-2 border-accent pt-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-sub">Stage {i + 1} · {s.days}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-sub">{s.note}</p>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-xs text-sub">Transit is a typical sailing band, not a booking; your quotation states the vessel and schedule.</p>
        <Link href={`/request?destination=${dest.country_code}`} className="rounded-sm bg-accent px-5 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">
          Get a C&amp;F quote to {dest.primary_port}
        </Link>
      </div>
    </section>
  );
}
