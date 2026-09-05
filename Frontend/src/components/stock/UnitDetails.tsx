import type { Unit } from '@/types/stock';

export function UnitDetails({ unit }: { unit: Unit }) {
  const specs = unit.category === 'vehicle'
    ? [
        { k: 'Mileage', v: unit.mileage != null ? `${unit.mileage.toLocaleString('en-US')} km` : '—' },
        { k: 'Engine', v: unit.engine ?? '—' },
        { k: 'Fuel', v: unit.fuelType ?? '—' },
        { k: 'Steering', v: unit.steeringPosition ?? '—' },
      ]
    : [
        { k: 'Hours', v: unit.hours != null ? `${unit.hours.toLocaleString('en-US')} hrs` : '—' },
        { k: 'Year', v: String(unit.year) },
      ];

  return (
    <section className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-ink px-2 py-1 text-xs font-semibold text-paper">GRADE {unit.auctionGrade}</span>
          {unit.steeringPosition && <span className="rounded-sm border border-line px-2 py-1 text-xs font-semibold text-ink">{unit.steeringPosition}</span>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{unit.year} {unit.make} {unit.model}</h1>
        <p className="mt-2 tabular-nums text-2xl font-semibold text-ink">
          ${unit.price.toLocaleString('en-US')} <span className="text-sm font-medium text-sub">FOB {unit.port}</span>
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
          <SheetRow k="Overall grade" v={unit.auctionGrade} />
          <SheetRow k="Chassis number" v={unit.chassisNumber} />
          <SheetRow k="修復歴 / Repair history" v={unit.repairHistory ? 'Disclosed on request' : 'None disclosed'} />
          <SheetRow k="Loading port" v={unit.port} />
        </dl>
      </figure>

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
