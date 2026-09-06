/**
 * Static figures — no count-up animation. Callers pass only stats worth stating;
 * a zero is dropped here so the band never advertises an empty catalog.
 */
export function StatsBand({ stats }: { stats: Array<{ target: number; suffix?: string; label: string }> }) {
  const shown = stats.filter((s) => s.target > 0).slice(0, 4);
  if (!shown.length) return null;
  // Static class names so Tailwind can see them.
  const cols = ['sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4'][shown.length - 1];
  return (
    <dl className={`grid grid-cols-2 border-y border-line ${cols}`}>
      {shown.map((stat, i) => (
        <div key={stat.label} className={`px-4 py-7 text-center ${i > 0 ? 'sm:border-l sm:border-line' : ''}`}>
          <dd className="font-mono text-[2.25rem] font-medium tabular-nums tracking-tight text-ink">
            {stat.target.toLocaleString('en-US')}
            {stat.suffix}
          </dd>
          <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-sub">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}
