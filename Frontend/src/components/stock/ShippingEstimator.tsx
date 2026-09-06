'use client';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { Select } from '@/components/ui';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';

export const DESTINATION_EVENT = 'mas:destination';

const MODE_LABEL: Record<string, string> = { roro: 'RoRo (drive-on)', container: 'Container', both: 'RoRo or container' };

const noopSubscribe = () => () => {};

function fmt(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ShippingEstimator({ destinations, originPort }: { destinations: Destination[]; originPort: string }) {
  // Site-wide remembered port (utility bar) wins over the first row; a pick here is
  // persisted the same way so every stock card switches to "C&F to <port>".
  const [preferred, setPreferred] = useDestinationPreference();
  const [picked, setPicked] = useState<string | null>(null);
  const code = picked ?? (preferred && destinations.some((d) => d.country_code === preferred) ? preferred : destinations[0]?.country_code ?? '');
  const dest = useMemo(() => destinations.find((d) => d.country_code === code) ?? null, [destinations, code]);
  // Current time is read only once hydrated — reading it during the server prerender
  // would make the shell non-deterministic (Next.js E1434) and mismatch on hydration.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const now = hydrated ? new Date() : null;

  if (!destinations.length) return null;

  const transit = dest?.estimated_transit_days ?? null;
  // Prep window: ~10 days for de-registration, export inspection, and booking.
  const PREP_DAYS = 10;
  const depart = now ? new Date(now.getTime() + PREP_DAYS * 86_400_000) : null;
  const arriveLo = depart && transit != null ? new Date(depart.getTime() + (transit - 4) * 86_400_000) : null;
  const arriveHi = depart && transit != null ? new Date(depart.getTime() + (transit + 4) * 86_400_000) : null;
  const originMismatch = dest && dest.origin_port !== originPort;

  const pick = (c: string) => {
    setPicked(c);
    setPreferred(c);
    window.dispatchEvent(new CustomEvent(DESTINATION_EVENT, { detail: c }));
  };

  return (
    <section aria-labelledby="shipping-heading" className="grid gap-6 rounded-sm border border-line bg-surface p-5 md:grid-cols-[1fr_1.4fr]" data-reveal>
      <div>
        <h2 id="shipping-heading" className="text-2xl font-semibold tracking-tight text-ink">Ship it to your port</h2>
        <p className="mt-2 text-sm text-sub">Pick your destination to see the route, sailing mode, and when this unit could realistically arrive if you confirm this week.</p>
        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wider text-sub">Destination</span>
          <Select className="mt-1.5 w-full" value={code} onChange={(e) => pick(e.target.value)}>
            {destinations.map((d) => (
              <option key={d.country_code} value={d.country_code}>{d.country_name} — {d.primary_port}</option>
            ))}
          </Select>
        </label>
        <a href="#quote" className="mt-4 inline-flex items-center justify-center rounded-sm bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">
          Request C&amp;F quote to {dest?.primary_port ?? 'this port'}
        </a>
      </div>

      {dest && (
        <div className="flex flex-col gap-4">
          <Route from={originMismatch ? dest.origin_port : originPort} to={dest.primary_port} transit={transit} />
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Stat k="Sailing mode" v={dest.shipping_mode ? MODE_LABEL[dest.shipping_mode] : 'Confirm on request'} />
            <Stat k="Transit" v={transit != null ? `≈ ${transit} days` : 'Confirm on request'} />
            <Stat k="Est. arrival" v={arriveLo && arriveHi ? `${fmt(arriveLo)} – ${fmt(arriveHi)}` : '—'} />
          </dl>
          <ol className="grid grid-cols-3 gap-2 text-[11px] text-sub">
            <Step n={1} t="Deposit & export prep" d={`~${PREP_DAYS} days in Japan`} />
            <Step n={2} t="Sailing" d={transit != null ? `~${transit} days at sea` : 'per schedule'} />
            <Step n={3} t="Clearance at port" d="B/L, invoice, export certificate" />
          </ol>
          {originMismatch && (
            <p className="text-xs text-sub">This unit is at {originPort}; sailings to {dest.primary_port} usually depart {dest.origin_port}. Inland transfer is included in your C&amp;F quote.</p>
          )}
          {dest.import_regulations_summary && <p className="text-xs leading-relaxed text-sub">{dest.import_regulations_summary}</p>}
        </div>
      )}
    </section>
  );
}

function Route({ from, to, transit }: { from: string; to: string; transit: number | null }) {
  return (
    <svg viewBox="0 0 420 70" className="w-full" role="img" aria-label={`Route from ${from} to ${to}${transit != null ? `, about ${transit} days` : ''}`}>
      <path d="M30 48 Q210 -10 390 48" fill="none" stroke="var(--color-line)" strokeWidth="2" />
      <path d="M30 48 Q210 -10 390 48" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 6" style={{ animation: 'dash 1.6s linear infinite' }} />
      <circle cx="30" cy="48" r="6" fill="var(--color-accent)" />
      <circle cx="390" cy="48" r="6" fill="var(--color-ink)" />
      <text x="30" y="66" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--color-ink)">{from}</text>
      <text x="390" y="66" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--color-ink)">{to}</text>
      {transit != null && <text x="210" y="24" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-sub)">≈ {transit} days</text>}
    </svg>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-sm border border-line px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-sub">{k}</dt>
      <dd className="mt-0.5 font-medium text-ink">{v}</dd>
    </div>
  );
}

function Step({ n, t, d }: { n: number; t: string; d: string }) {
  return (
    <li className="flex flex-col gap-0.5 border-t-2 border-line pt-1.5">
      <span className="font-semibold text-ink">{n}. {t}</span>
      <span>{d}</span>
    </li>
  );
}
