import Link from 'next/link';
import { formatInt, formatUsd } from '@/lib/format';
import { CountUp } from '@/components/stock/CountUp';
import type { MarketPosition, PricePoint, Unit } from '@/types/stock';

export function MarketPositionPanel({ unit, market, points }: { unit: Unit; market: MarketPosition; points: PricePoint[] }) {
  const usage = unit.category === 'vehicle' ? unit.mileage_km : unit.operating_hours;
  if (market.peer_count === 0) return null;

  return (
    <section aria-labelledby="market-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="market-heading" className="text-2xl font-semibold tracking-tight text-ink">Where this unit sits in our stock</h2>
        <p className="text-sm text-sub">
          Compared with <span className="font-semibold text-ink">{market.peer_count}</span> other {market.label} in stock right now
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PriceRange unit={unit} market={market} />
        <UsageGauge usage={usage} market={market} />
        <div className="md:col-span-2"><PriceScatter market={market} points={points} /></div>
        <GradeBars market={market} current={unit.auction_grade} />
        <Headline unit={unit} market={market} usage={usage} />
      </div>
    </section>
  );
}

// ---- Price range: min → median → max, with this unit's marker ----------------

function PriceRange({ unit, market }: { unit: Unit; market: MarketPosition }) {
  const { price_min: min, price_max: max, price_median: median } = market;
  if (min == null || max == null || median == null) return null;
  const lo = Math.min(min, unit.price_usd);
  const hi = Math.max(max, unit.price_usd);
  const pct = (v: number) => (hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100);

  return (
    <figure className="rounded-sm border border-line bg-surface p-5" data-reveal>
      <figcaption className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-sub">
        <span>Asking price vs peers</span>
        <span className="text-ink">{market.price_percentile}th percentile</span>
      </figcaption>
      <div className="relative mt-8 h-2.5 rounded-sm bg-line">
        <div className="absolute inset-y-0 origin-left rounded-sm bg-ink/20" style={{ left: `${pct(min)}%`, width: `${pct(max) - pct(min)}%`, animation: 'grow 0.8s ease-out both' }} />
        <div className="absolute -top-1 h-[18px] w-0.5 bg-sub" style={{ left: `${pct(median)}%` }} aria-hidden />
        <div
          className="absolute -top-2 flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${pct(unit.price_usd)}%`, animation: 'slidemark 0.9s cubic-bezier(.2,.8,.2,1) 0.3s both' }}
        >
          <span className="h-[26px] w-[26px] rounded-full border-[3px] border-surface bg-accent shadow" aria-hidden />
          <span className="mt-1 whitespace-nowrap text-xs font-semibold tabular-nums text-accent">{formatUsd(unit.price_usd)}</span>
        </div>
      </div>
      <dl className="mt-10 grid grid-cols-3 text-xs">
        <div><dt className="text-sub">Lowest</dt><dd className="font-semibold tabular-nums text-ink">{formatUsd(min)}</dd></div>
        <div className="text-center"><dt className="text-sub">Median</dt><dd className="font-semibold tabular-nums text-ink">{formatUsd(median)}</dd></div>
        <div className="text-right"><dt className="text-sub">Highest</dt><dd className="font-semibold tabular-nums text-ink">{formatUsd(max)}</dd></div>
      </dl>
    </figure>
  );
}

// ---- Usage gauge: this unit's km/hrs against the peer average -----------------

function UsageGauge({ usage, market }: { usage: number | null | undefined; market: MarketPosition }) {
  const avg = market.usage_avg;
  if (usage == null || avg == null || avg === 0) return null;
  const ratio = usage / avg;
  const fill = Math.min(1, ratio / 2); // gauge spans 0 → 2× peer average
  const r = 70;
  const len = Math.PI * r;
  const delta = Math.round((ratio - 1) * 100);
  const label = market.usage_unit === 'km' ? 'Mileage' : 'Operating hours';

  return (
    <figure className="grid grid-cols-[auto_1fr] items-center gap-5 rounded-sm border border-line bg-surface p-5" data-reveal>
      <svg viewBox="0 0 160 96" className="h-[96px] w-[160px]" role="img" aria-label={`${label} ${formatInt(usage)} ${market.usage_unit}, ${Math.abs(delta)}% ${delta <= 0 ? 'below' : 'above'} the peer average of ${formatInt(avg)}`}>
        <path d={`M10 86 A ${r} ${r} 0 0 1 150 86`} fill="none" stroke="var(--color-line)" strokeWidth="12" strokeLinecap="round" />
        <path
          d={`M10 86 A ${r} ${r} 0 0 1 150 86`} fill="none" stroke={ratio <= 1 ? 'var(--color-accent)' : 'var(--color-sub)'} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={len}
          style={{ ['--arc-len' as string]: len, ['--arc-target' as string]: len * (1 - fill), strokeDashoffset: len * (1 - fill), animation: 'drawarc 1.1s cubic-bezier(.2,.8,.2,1) both' }}
        />
        <line x1="80" y1="86" x2="80" y2="24" stroke="var(--color-sub)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="80" y="18" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--color-sub)">PEER AVG</text>
        <text x="80" y="76" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--color-ink)">{formatInt(usage)}</text>
        <text x="80" y="90" textAnchor="middle" fontSize="8" fontWeight="600" letterSpacing="1" fill="var(--color-sub)">{market.usage_unit.toUpperCase()}</text>
      </svg>
      <figcaption>
        <p className="text-xs font-semibold uppercase tracking-wider text-sub">{label} vs peers</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
          <CountUp value={Math.abs(delta)} suffix="%" /> <span className="text-base font-medium text-sub">{delta <= 0 ? 'below' : 'above'} average</span>
        </p>
        <p className="mt-1 text-xs text-sub">Peer average {formatInt(avg)} {market.usage_unit} · lower than {market.usage_percentile != null ? 100 - market.usage_percentile : '—'}% of peers</p>
      </figcaption>
    </figure>
  );
}

// ---- Scatter: price vs usage for every peer, this unit highlighted ------------

function PriceScatter({ market, points }: { market: MarketPosition; points: PricePoint[] }) {
  const plotted = points.filter((p) => p.usage != null);
  if (plotted.length < 3) return null;
  const W = 720, H = 300, PL = 64, PR = 20, PT = 20, PB = 40;
  const xs = plotted.map((p) => p.usage as number);
  const ys = plotted.map((p) => p.price_usd);
  const xMax = Math.max(...xs) * 1.08 || 1;
  const yMin = Math.min(...ys) * 0.9;
  const yMax = Math.max(...ys) * 1.08;
  const sx = (v: number) => PL + (v / xMax) * (W - PL - PR);
  const sy = (v: number) => PT + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PT - PB);
  const ticks = (n: number, max: number, min = 0) => Array.from({ length: n + 1 }, (_, i) => min + ((max - min) * i) / n);
  const current = plotted.find((p) => p.is_current);

  return (
    <figure className="rounded-sm border border-line bg-surface p-5" data-reveal>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-sub">
        <span>Price vs {market.usage_unit === 'km' ? 'mileage' : 'hours'} · {market.label}</span>
        <span className="flex items-center gap-3 normal-case tracking-normal">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-accent" /> This unit</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sub/50" /> In stock ({plotted.length - 1})</span>
        </span>
      </figcaption>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 min-w-[520px] w-full" role="img" aria-label={`Scatter chart of ${plotted.length} units: price against ${market.usage_unit}`}>
          {ticks(4, yMax, yMin).map((t) => (
            <g key={`y${t}`}>
              <line x1={PL} x2={W - PR} y1={sy(t)} y2={sy(t)} stroke="var(--color-line)" strokeWidth="1" />
              <text x={PL - 8} y={sy(t) + 3.5} textAnchor="end" fontSize="10" fill="var(--color-sub)">{formatUsd(t)}</text>
            </g>
          ))}
          {ticks(5, xMax).map((t) => (
            <text key={`x${t}`} x={sx(t)} y={H - PB + 18} textAnchor="middle" fontSize="10" fill="var(--color-sub)">{formatInt(Math.round(t))}</text>
          ))}
          <text x={(PL + W - PR) / 2} y={H - 6} textAnchor="middle" fontSize="10" fontWeight="600" letterSpacing="1" fill="var(--color-sub)">
            {market.usage_unit === 'km' ? 'MILEAGE (KM)' : 'OPERATING HOURS'}
          </text>
          {plotted.filter((p) => !p.is_current).map((p, i) => (
            <Link key={p.id} href={`/stock/${p.slug}`}>
              <circle
                cx={sx(p.usage as number)} cy={sy(p.price_usd)} r="6" fill="var(--color-sub)" fillOpacity="0.45"
                style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `pop 0.5s ease-out ${120 + i * 35}ms both` }}
                className="hover:fill-opacity-100"
              >
                <title>{`${p.year} · ${formatUsd(p.price_usd)} · ${formatInt(p.usage as number)} ${market.usage_unit} · grade ${p.auction_grade}`}</title>
              </circle>
            </Link>
          ))}
          {current && (
            <g style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: `pop 0.6s ease-out ${200 + plotted.length * 35}ms both` }}>
              <circle cx={sx(current.usage as number)} cy={sy(current.price_usd)} r="9" fill="var(--color-accent)" fillOpacity="0.35" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'ringpulse 2.4s ease-out infinite' }} />
              <circle cx={sx(current.usage as number)} cy={sy(current.price_usd)} r="8" fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth="3">
                <title>{`This unit · ${formatUsd(current.price_usd)} · ${formatInt(current.usage as number)} ${market.usage_unit}`}</title>
              </circle>
            </g>
          )}
        </svg>
      </div>
      <p className="mt-2 text-xs text-sub">Each grey dot is a unit currently in our stock — click one to open it.</p>
    </figure>
  );
}

// ---- Grade distribution among peers ------------------------------------------

function GradeBars({ market, current }: { market: MarketPosition; current: string }) {
  const max = Math.max(1, ...market.grade_distribution.map((g) => g.count));
  return (
    <figure className="rounded-sm border border-line bg-surface p-5" data-reveal>
      <figcaption className="text-xs font-semibold uppercase tracking-wider text-sub">Auction grades among peers</figcaption>
      <dl className="mt-4 flex flex-col gap-2">
        {market.grade_distribution.map((g, i) => {
          const active = g.grade === current;
          return (
            <div key={g.grade} className="grid grid-cols-[2.4rem_1fr_2.5rem] items-center gap-2.5">
              <dt className={`text-sm font-semibold tabular-nums ${active ? 'text-accent' : 'text-ink'}`}>{g.grade}{active && <span className="sr-only"> (this unit)</span>}</dt>
              <div className="h-2.5 overflow-hidden rounded-sm bg-line">
                <div className={`h-full origin-left rounded-sm ${active ? 'bg-accent' : 'bg-ink/30'}`} style={{ width: `${(g.count / max) * 100}%`, animation: `grow 0.7s ease-out ${i * 70}ms both` }} />
              </div>
              <dd className="text-right text-xs font-medium tabular-nums text-sub">{g.count}</dd>
            </div>
          );
        })}
      </dl>
    </figure>
  );
}

// ---- Plain-English takeaway ---------------------------------------------------

function Headline({ unit, market, usage }: { unit: Unit; market: MarketPosition; usage: number | null | undefined }) {
  const pp = market.price_percentile;
  const up = market.usage_percentile;
  const lines: string[] = [];
  if (pp != null) lines.push(pp <= 35 ? `Priced in the cheapest ${pp}% of comparable stock.` : pp >= 65 ? `Priced above ${pp}% of comparable stock — expect a higher grade or spec to match.` : 'Priced right around the middle of comparable stock.');
  if (usage != null && up != null) lines.push(up <= 35 ? `Lower ${market.usage_unit === 'km' ? 'mileage' : 'hours'} than ${100 - up}% of peers.` : up >= 65 ? `Higher ${market.usage_unit === 'km' ? 'mileage' : 'hours'} than most peers — reflected in the price.` : 'Typical usage for its peer group.');
  lines.push(unit.repair_history ? 'Repair history is disclosed on the auction sheet — ask us for the full record.' : 'No repair history recorded by the auction inspector.');

  return (
    <div className="flex flex-col justify-center gap-3 rounded-sm bg-ink p-5 text-paper" data-reveal>
      <p className="text-xs font-semibold uppercase tracking-wider text-paper/60">At a glance</p>
      <ul className="flex flex-col gap-2 text-sm leading-relaxed">
        {lines.map((l) => (
          <li key={l} className="flex gap-2.5"><span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden />{l}</li>
        ))}
      </ul>
    </div>
  );
}
