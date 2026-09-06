import { formatInt, formatUsage } from '@/lib/format';
import type { Unit } from '@/types/stock';

export function SpecGrid({ unit }: { unit: Unit }) {
  const isVehicle = unit.category === 'vehicle';
  const specs: Array<{ k: string; v: string | null | undefined }> = isVehicle
    ? [
        { k: 'Mileage', v: formatUsage(unit.mileage_km, 'km') },
        { k: 'Engine', v: unit.engine },
        { k: 'Displacement', v: unit.displacement_cc ? `${formatInt(unit.displacement_cc)} cc` : null },
        { k: 'Transmission', v: unit.transmission },
        { k: 'Drivetrain', v: unit.drivetrain },
        { k: 'Fuel', v: unit.fuel_type },
        { k: 'Steering', v: unit.steering_position === 'LHD' ? 'Left-hand drive' : unit.steering_position === 'RHD' ? 'Right-hand drive' : null },
        { k: 'Body', v: unit.body_type },
        { k: 'Exterior colour', v: unit.color },
        { k: 'Model year', v: String(unit.year) },
      ]
    : [
        { k: 'Operating hours', v: formatUsage(unit.operating_hours, 'hrs') },
        { k: 'Engine', v: unit.engine },
        { k: 'Displacement', v: unit.displacement_cc ? `${formatInt(unit.displacement_cc)} cc` : null },
        { k: 'Fuel', v: unit.fuel_type },
        { k: 'Type', v: unit.body_type },
        { k: 'Model year', v: String(unit.year) },
        { k: 'Colour', v: unit.color },
        { k: 'Loading port', v: unit.port },
      ];

  return (
    <section aria-labelledby="specs-heading" data-reveal>
      <h2 id="specs-heading" className="mb-4 text-xs font-semibold uppercase tracking-wider text-sub">Specification</h2>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {specs.map((s) => (
          <div key={s.k} className="bg-surface px-4 py-3.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-sub">{s.k}</dt>
            <dd className={`mt-1 text-sm font-medium tabular-nums ${s.v ? 'text-ink' : 'text-sub'}`}>{s.v || 'Confirm on request'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
