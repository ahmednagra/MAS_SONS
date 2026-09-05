const ORIGIN = { cx: 520, cy: 50 };

export function ShippingMap({ lanes }: { lanes: Array<{ port: string; cx: number; cy: number; transit: string }> }) {
  return (
    <figure className="border border-line bg-surface p-4">
      <svg
        viewBox="0 0 600 260"
        role="img"
        aria-label={`Shipping routes from Yokohama and Nagoya, Japan to ${lanes.map((l) => l.port).join(', ')}`}
        className="w-full text-sub"
      >
        <g className="text-line" opacity={0.5}>
          <path d="M-10,40 Q300,-10 610,40" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M-10,110 Q300,70 610,110" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M-10,180 Q300,140 610,180" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M-10,250 Q300,210 610,250" fill="none" stroke="currentColor" strokeWidth="1" />
        </g>
        <g>
          {lanes.map((lane) => (
            <path
              key={lane.port}
              d={`M${ORIGIN.cx},${ORIGIN.cy} Q${(ORIGIN.cx + lane.cx) / 2},${(ORIGIN.cy + lane.cy) / 2 - 20} ${lane.cx},${lane.cy}`}
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5"
              style={{ animation: 'dash 2.6s linear infinite' }}
            />
          ))}
        </g>
        <circle cx={ORIGIN.cx} cy={ORIGIN.cy} r="7" fill="var(--color-accent)" />
        <text x={ORIGIN.cx} y={ORIGIN.cy - 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-accent)">
          JAPAN
        </text>
        {lanes.map((lane) => (
          <g key={lane.port}>
            <circle cx={lane.cx} cy={lane.cy} r="5" fill="currentColor" />
            <text x={lane.cx + 12} y={lane.cy - 6} fontSize="11" fontWeight="600" fill="var(--color-ink)">{lane.port}</text>
            <text x={lane.cx + 12} y={lane.cy + 8} fontSize="9.5" fontWeight="500" fill="currentColor">{lane.transit}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
