import type { Unit } from '@/types/stock';

export function UnitDetails({ unit }: { unit: Unit }) {
  const specs = unit.category === 'vehicle'
    ? [
        { k: 'Mileage', v: unit.mileage_km != null ? `${unit.mileage_km.toLocaleString('en-US')} km` : '—' },
        { k: 'Engine', v: unit.engine ?? '—' },
        { k: 'Fuel', v: unit.fuel_type ?? '—' },
        { k: 'Steering', v: unit.steering_position ?? '—' },
      ]
    : [
        { k: 'Hours', v: unit.operating_hours != null ? `${unit.operating_hours.toLocaleString('en-US')} hrs` : '—' },
        { k: 'Year', v: String(unit.year) },
      ];

  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-ink px-2 py-1 text-xs font-semibold text-paper">GRADE {unit.auction_grade}</span>
          {unit.steering_position && <span className="rounded-sm border border-line px-2 py-1 text-xs font-semibold text-ink">{unit.steering_position}</span>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{unit.year} {unit.make} {unit.model}</h1>
        <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">
          ${unit.price_usd.toLocaleString('en-US')} <span className="text-sm font-medium text-sub">FOB {unit.port}</span>
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 sm:grid-cols-4">
        {specs.map((s) => (
          <div key={s.k}>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-sub">{s.k}</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{s.v}</dd>
          </div>
        ))}
      </dl>

      <figure className="border border-line bg-paper p-4">
        <figcaption className="mb-3 text-xs font-semibold uppercase tracking-wider text-sub">Auction inspection sheet</figcaption>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          <SheetRow k="Overall grade" v={unit.auction_grade} />
          <SheetRow k="Chassis number" v={unit.chassis_number} />
          <SheetRow k="修復歴 / Repair history" v={unit.repair_history ? 'Disclosed on request' : 'None disclosed'} />
          <SheetRow k="Loading port" v={unit.port} />
        </dl>
      </figure>

      {unit.features.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-sub">Confirmed equipment</h2>
          <div className="flex flex-wrap gap-2">
            {unit.features.map((f) => (
              <span key={f.id} className="rounded-sm border border-line px-2.5 py-1 text-xs font-medium text-ink">{f.name}</span>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm leading-relaxed text-sub">{unit.description}</p>
    </section>
  );
}

function SheetRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line pb-2">
      <dt className="text-sub">{k}</dt>
      <dd className="font-medium text-ink">{v}</dd>
    </div>
  );
}
