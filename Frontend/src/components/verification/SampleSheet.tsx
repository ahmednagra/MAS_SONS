/**
 * Illustrative auction sheet drawn in the site palette, with callouts to the boxes a buyer
 * should read first. Clearly labelled as an example; real sheets are shared per unit.
 */
export function SampleSheet() {
  const ink = 'var(--color-ink)';
  const sub = 'var(--color-sub)';
  const line = 'var(--color-line)';
  const accent = 'var(--color-accent)';
  return (
    <figure className="rounded-sm border border-line bg-surface p-4">
      <svg viewBox="0 0 640 420" className="w-full" role="img" aria-label="Example auction inspection sheet with the grade, mileage, repair-history field and diagram marks highlighted">
        {/* sheet body */}
        <rect x="20" y="16" width="600" height="388" fill="var(--color-paper)" stroke={line} />
        <text x="36" y="42" fontSize="13" fontWeight="700" fill={ink}>出品票 · AUCTION SHEET</text>
        <text x="604" y="42" fontSize="10" textAnchor="end" fill={sub}>Lot 1234 · Yokohama</text>

        {/* top boxes: grade / mileage / repair history */}
        {[
          { x: 36, w: 120, label: '評価点 GRADE', value: '4.5' },
          { x: 168, w: 170, label: '走行距離 MILEAGE', value: '48,210 km' },
          { x: 350, w: 120, label: '修復歴 REPAIR', value: '無 none' },
          { x: 482, w: 122, label: '内装 INTERIOR', value: 'B' },
        ].map((b) => (
          <g key={b.label}>
            <rect x={b.x} y="56" width={b.w} height="46" fill="var(--color-surface)" stroke={line} />
            <text x={b.x + 8} y="71" fontSize="8.5" fill={sub}>{b.label}</text>
            <text x={b.x + 8} y="93" fontSize="16" fontWeight="700" fill={ink}>{b.value}</text>
          </g>
        ))}

        {/* car diagram */}
        <g transform="translate(36 120)">
          <rect x="0" y="0" width="300" height="260" fill="var(--color-surface)" stroke={line} />
          <text x="10" y="16" fontSize="8.5" fill={sub}>外装 EXTERIOR DIAGRAM</text>
          <path d="M60 80 L100 40 H200 L240 80 V200 L200 236 H100 L60 200 Z" fill="none" stroke={ink} strokeWidth="1.5" />
          <line x1="60" y1="140" x2="240" y2="140" stroke={line} />
          <line x1="150" y1="40" x2="150" y2="236" stroke={line} />
          {/* marks */}
          <text x="88" y="112" fontSize="12" fontWeight="700" fill={accent}>A2</text>
          <text x="196" y="182" fontSize="12" fontWeight="700" fill={accent}>U1</text>
          <text x="112" y="226" fontSize="12" fontWeight="700" fill={accent}>W1</text>
        </g>

        {/* notes */}
        <g transform="translate(350 120)">
          <rect x="0" y="0" width="254" height="260" fill="var(--color-surface)" stroke={line} />
          <text x="10" y="16" fontSize="8.5" fill={sub}>検査員記事 INSPECTOR NOTES</text>
          {['ワンオーナー · one owner', '記録簿あり · service book present', 'タイヤ 7分 · tyres ~70%', 'エンジン良好 · engine good'].map((t, i) => (
            <text key={t} x="10" y={40 + i * 22} fontSize="10.5" fill={ink}>{t}</text>
          ))}
          <line x1="10" y1="140" x2="244" y2="140" stroke={line} />
          <text x="10" y="160" fontSize="8.5" fill={sub}>装備 EQUIPMENT</text>
          <text x="10" y="180" fontSize="10.5" fill={ink}>AC · PS · PW · SR · NAVI · AW</text>
        </g>

        {/* callouts */}
        {[
          { x: 96, y: 108, n: 1 },
          { x: 253, y: 108, n: 2 },
          { x: 410, y: 108, n: 3 },
          { x: 136, y: 248, n: 4 },
          { x: 476, y: 128, n: 5 },
        ].map((c) => (
          <g key={c.n}>
            <circle cx={c.x} cy={c.y} r="9" fill={accent} />
            <text x={c.x} y={c.y + 3.5} fontSize="10" fontWeight="700" textAnchor="middle" fill="var(--color-accent-ink)">{c.n}</text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 grid gap-x-6 gap-y-1 text-xs text-sub sm:grid-cols-2">
        <span><b className="text-ink">1 Grade</b> · the inspector&rsquo;s overall score, 5 down to R.</span>
        <span><b className="text-ink">2 Mileage</b> · odometer reading at inspection; we photograph it again at listing.</span>
        <span><b className="text-ink">3 Repair history</b> · 無 means none; 有 means a frame repair, which forces an R grade.</span>
        <span><b className="text-ink">4 Diagram marks</b> · code plus severity, for example A2 = a medium scratch on that panel.</span>
        <span className="sm:col-span-2"><b className="text-ink">5 Notes</b> · free text from the inspector; we translate it on the listing.</span>
        <span className="sm:col-span-2 italic">Illustrative example, not a real unit. Every listing links to its own original sheet.</span>
      </figcaption>
    </figure>
  );
}
