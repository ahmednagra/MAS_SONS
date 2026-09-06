import { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: ReactNode }) {
  return (
    <div className="mb-12">
      <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h1 className="font-display max-w-2xl text-[2.5rem] leading-[1.05] text-ink sm:text-[3rem]">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-sub">{description}</p>}
    </div>
  );
}
