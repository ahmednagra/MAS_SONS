export function StockSplitDonut({ vehicles, equipment }: { vehicles: number; equipment: number }) {
  const total = vehicles + equipment;
  const circumference = 2 * Math.PI * 54;
  const vehicleArc = (vehicles / total) * circumference;

  return (
    <figure className="grid grid-cols-[auto_1fr] items-center gap-5 border border-line bg-surface p-5">
      <svg
        viewBox="0 0 140 140"
        role="img"
        aria-label={`Donut chart: ${vehicles} of ${total} units in stock are vehicles, ${equipment} are heavy equipment`}
        className="h-[124px] w-[124px]"
      >
        <circle cx="70" cy="70" r="54" fill="none" stroke="var(--color-line)" strokeWidth="17" />
        <circle
          cx="70" cy="70" r="54" fill="none" stroke="var(--color-accent)" strokeWidth="17"
          strokeDasharray={`${vehicleArc} ${circumference}`} strokeLinecap="butt" transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" fontSize="24" fontWeight="600" fill="var(--color-ink)">
          {total.toLocaleString('en-US')}
        </text>
        <text x="70" y="84" textAnchor="middle" fontSize="9" fontWeight="600" letterSpacing="1.4" fill="var(--color-sub)">
          UNITS
        </text>
      </svg>
      <figcaption>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sub">Stock split</p>
        <dl className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2.5">
            <span aria-hidden className="h-2.5 w-2.5 flex-none bg-accent" />
            <dt className="text-sm font-medium text-ink">Vehicles</dt>
            <dd className="ml-auto text-sm font-semibold tabular-nums text-ink">{vehicles.toLocaleString('en-US')}</dd>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span aria-hidden className="h-2.5 w-2.5 flex-none bg-line" />
            <dt className="text-sm font-medium text-ink">Heavy equipment</dt>
            <dd className="ml-auto text-sm font-semibold tabular-nums text-ink">{equipment.toLocaleString('en-US')}</dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
