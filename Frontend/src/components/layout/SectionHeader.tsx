import type { ReactNode } from 'react';

/**
 * The one header pattern every home-page section uses: eyebrow, title, optional
 * one-line description, left-aligned at the same x position. `aside` is the slot
 * for a single "View all" style link on the right.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  aside,
  id,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">{eyebrow}</p>}
        <h2 id={id} className="font-display text-[2rem] leading-[1.05] text-ink sm:text-[2.25rem]">{title}</h2>
        {description && <p className="mt-2 text-[15px] leading-relaxed text-sub">{description}</p>}
      </div>
      {aside && <div className="text-sm font-medium text-ink">{aside}</div>}
    </div>
  );
}
