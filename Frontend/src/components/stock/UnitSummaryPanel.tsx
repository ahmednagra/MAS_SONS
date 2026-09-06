import Link from 'next/link';
import { env } from '@/lib/env';
import { formatUsage, formatUsd } from '@/lib/format';
import { Badge, Card, StatusPill } from '@/components/ui';
import type { MarketPosition, Unit } from '@/types/stock';

export function UnitSummaryPanel({ unit, market }: { unit: Unit; market: MarketPosition | null }) {
  const title = `${unit.year} ${unit.make} ${unit.model}`;
  const usageUnit = unit.category === 'vehicle' ? 'km' : 'hrs';
  const usage = unit.category === 'vehicle' ? unit.mileage_km : unit.operating_hours;
  const wa = env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `https://wa.me/${env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello M.A.S & SONS, I'm interested in ${title} (ref ${unit.slug}).`)}`
    : null;
  const belowMedian = market?.price_median != null && unit.price_usd < market.price_median;

  return (
    <section aria-labelledby="unit-title" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="ink">Grade {unit.auction_grade}</Badge>
        {unit.steering_position && <Badge>{unit.steering_position}</Badge>}
        {unit.drivetrain && <Badge>{unit.drivetrain}</Badge>}
        {!unit.repair_history && <Badge tone="accent">No repair history</Badge>}
        {unit.one_owner && <Badge tone="accent">One owner</Badge>}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sub">Ref {unit.slug}</p>
        <h1 id="unit-title" className="mt-1.5 text-3xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-[2.1rem]">{title}</h1>
        <p className="mt-2 text-sm text-sub">
          {[unit.body_type, unit.color, usage != null ? formatUsage(usage, usageUnit) : null].filter(Boolean).join(' · ')}
        </p>
      </div>

      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-sub">Vehicle price · FOB {unit.port}</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-ink">{formatUsd(unit.price_usd)}</p>
        {market && market.peer_count > 0 && market.price_median != null && (
          <p className="mt-2 text-xs text-sub">
            {belowMedian ? 'Below' : 'Above'} the {formatUsd(market.price_median)} median of {market.peer_count} comparable{' '}
            {market.scope === 'model' ? `${market.label} units` : market.scope === 'body_type' ? `${unit.body_type.toLowerCase()}s` : 'units'} in stock.
          </p>
        )}
        <p className="mt-3 border-t border-line pt-3 text-xs text-sub">
          C&amp;F / CIF price to your port is quoted within one business day. Freight, insurance, and pre-shipment inspection itemised — no hidden fees.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Link href="#quote" className="inline-flex items-center justify-center rounded-sm bg-accent px-4 py-3 text-sm font-semibold text-accent-ink hover:opacity-90">
            Get a C&amp;F quote
          </Link>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-sm border border-ink px-4 py-3 text-sm font-semibold text-ink hover:bg-surface">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          ) : (
            <Link href="#quote" className="inline-flex items-center justify-center rounded-sm border border-ink px-4 py-3 text-sm font-semibold text-ink hover:bg-surface">
              Ask a question
            </Link>
          )}
        </div>
      </Card>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-sub">
        {['Auction sheet verified', 'Japan-based exporter', 'Export documents included', 'Secure bank payment'].map((t) => (
          <li key={t} className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
            {t}
          </li>
        ))}
      </ul>

      <StatusPill status={unit.status} />
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8c.1.2 1.9 2.9 4.6 4 1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" />
    </svg>
  );
}
