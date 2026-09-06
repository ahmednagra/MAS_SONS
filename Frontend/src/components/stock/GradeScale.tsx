import Link from 'next/link';
import type { AuctionGrade } from '@/types/stock';

const SCALE: Array<{ grade: AuctionGrade; title: string; note: string }> = [
  { grade: '5', title: 'Like new', note: 'Under ~10,000 km, no flaws worth noting.' },
  { grade: '4.5', title: 'Excellent', note: 'Very minor cosmetic marks only.' },
  { grade: '4', title: 'Very good', note: 'Small scratches or dents, no repair history.' },
  { grade: '3.5', title: 'Good', note: 'Visible wear; may need light cosmetic work.' },
  { grade: '3', title: 'Fair', note: 'Noticeable wear or higher mileage.' },
  { grade: 'R', title: 'Repaired', note: 'Accident history, professionally repaired.' },
  { grade: 'RA', title: 'Repaired (minor)', note: 'Minor structural repair disclosed.' },
];

export function GradeScale({ grade }: { grade: AuctionGrade }) {
  const idx = SCALE.findIndex((s) => s.grade === grade);
  const current = SCALE[idx];

  return (
    <figure className="rounded-sm border border-line bg-surface p-5" data-reveal>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-sub">Japanese auction grade scale</span>
        <span className="text-sm font-semibold text-ink">This unit: {current.grade} · {current.title}</span>
      </figcaption>

      <ol className="mt-4 grid grid-cols-7 gap-1" aria-label="Grade scale from 5 (best) to RA">
        {SCALE.map((s, i) => {
          const active = i === idx;
          return (
            <li key={s.grade} className="flex flex-col items-center gap-1.5">
              <div
                className={`h-2.5 w-full origin-left rounded-sm ${active ? 'bg-accent' : i < idx ? 'bg-ink/25' : 'bg-line'}`}
                style={{ animation: `grow 0.6s ease-out ${i * 60}ms both` }}
              />
              <span className={`text-xs font-semibold tabular-nums ${active ? 'text-accent' : 'text-sub'}`}>{s.grade}</span>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-sm leading-relaxed text-sub">
        <strong className="font-semibold text-ink">Grade {current.grade} — {current.title}.</strong> {current.note}{' '}
        Grades are assigned by independent auction-house inspectors in Japan, not by the seller. We share the original sheet on request so you can verify every mark yourself.{' '}
        <Link href="/verification" className="font-medium text-ink underline-offset-4 hover:underline">How grades and sheet symbols work →</Link>
      </p>
    </figure>
  );
}
