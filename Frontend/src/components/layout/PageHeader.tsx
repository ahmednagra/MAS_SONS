import { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: ReactNode }) {
  return (
    <div className="mb-12">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-sub">{eyebrow}</p>
      <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-ink">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-sub">{description}</p>}
    </div>
  );
}
