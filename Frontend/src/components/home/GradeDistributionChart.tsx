const HIGH_GRADES = new Set(['5', '4.5', '4']);

export function GradeDistributionChart({ distribution }: { distribution: Array<{ grade: string; count: number }> }) {
  const total = distribution.reduce((sum, g) => sum + g.count, 0);
  const max = Math.max(...distribution.map((g) => g.count));
  const highShare = Math.round((distribution.filter((g) => HIGH_GRADES.has(g.grade)).reduce((sum, g) => sum + g.count, 0) / total) * 100);

  return (
    <figure className="border border-line bg-paper p-4">
      <figcaption className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3 text-xs font-semibold uppercase tracking-wider text-sub">
        <span>Current stock by grade</span>
        <span className="tabular-nums text-ink">{highShare}% at 4.0 or better</span>
      </figcaption>
      <dl className="flex flex-col gap-2.5">
        {distribution.map((g) => (
          <div key={g.grade} className="grid grid-cols-[2.2rem_1fr_3.5rem] items-center gap-2.5">
            <dt className="text-sm font-semibold tabular-nums text-ink">{g.grade}</dt>
            <div className="h-2.5 overflow-hidden bg-line">
              <div
                className="h-full origin-left bg-accent"
                style={{ width: `${(g.count / max) * 100}%`, animation: 'grow 0.8s ease-out' }}
              />
            </div>
            <dd className="text-right text-xs font-medium tabular-nums text-sub">{g.count.toLocaleString('en-US')}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
