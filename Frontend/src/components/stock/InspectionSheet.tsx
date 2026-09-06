import type { Unit } from '@/types/stock';

export function InspectionSheet({ unit }: { unit: Unit }) {
  const rows: Array<{ k: string; v: React.ReactNode; tone?: 'ok' | 'warn' }> = [
    { k: 'Overall grade', v: unit.auction_grade },
    { k: 'Chassis / VIN', v: <span className="font-mono text-[13px]">{unit.chassis_number}</span> },
    { k: '修復歴 / Repair history', v: unit.repair_history ? 'Disclosed — full record on request' : 'None recorded', tone: unit.repair_history ? 'warn' : 'ok' },
    { k: 'Owners', v: unit.one_owner == null ? 'Confirm on request' : unit.one_owner ? 'One owner' : 'Multiple owners' },
    { k: 'Loading port', v: `${unit.port}, Japan` },
    { k: 'Listed', v: new Date(unit.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
  ];

  return (
    <figure className="rounded-sm border border-line bg-surface p-5" data-reveal>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-sub">Auction inspection sheet</span>
        {unit.auction_sheet_url ? (
          <a href={unit.auction_sheet_url} target="_blank" rel="noopener" className="text-sm font-semibold text-accent hover:underline">Open original sheet ↗</a>
        ) : (
          <a href="#quote" className="text-sm font-semibold text-accent hover:underline">Request original sheet</a>
        )}
      </figcaption>
      <dl className="mt-4 grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.k} className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <dt className="text-sub">{r.k}</dt>
            <dd className={`text-right font-medium ${r.tone === 'ok' ? 'text-accent' : r.tone === 'warn' ? 'text-ink' : 'text-ink'}`}>{r.v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-sub">
        Every unit we list was graded by an independent Japanese auction inspector. The sheet records scratches, dents, corrosion, and any repair to the body frame in a standard diagram — we translate it for you and walk through it on a call if you like.
      </p>
    </figure>
  );
}
