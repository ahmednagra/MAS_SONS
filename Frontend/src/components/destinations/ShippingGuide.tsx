import type { Destination } from '@/types/destinations';

const MODE_LABEL: Record<string, string> = { roro: 'RoRo (drive-on)', container: 'Container', both: 'RoRo or container' };

export function ShippingGuide({ info }: { info: Destination }) {
  return (
    <section className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Shipping to {info.country_name}</h1>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-sm border border-line bg-surface p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-sub">Route</dt>
          <dd className="mt-0.5 font-medium text-ink">{info.origin_port} → {info.primary_port}</dd>
        </div>
        <div className="rounded-sm border border-line bg-surface p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-sub">Transit</dt>
          <dd className="mt-0.5 font-medium text-ink">{info.estimated_transit_days != null ? `≈ ${info.estimated_transit_days} days` : 'On request'}</dd>
        </div>
        <div className="rounded-sm border border-line bg-surface p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-sub">Mode</dt>
          <dd className="mt-0.5 font-medium text-ink">{info.shipping_mode ? MODE_LABEL[info.shipping_mode] : 'On request'}</dd>
        </div>
      </dl>
      {info.import_regulations_summary && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-sub">{info.import_regulations_summary}</p>}
    </section>
  );
}
