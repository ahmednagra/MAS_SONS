'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import type { PhotoType, UnitImage } from '@/types/stock';

const TYPE_LABEL: Record<PhotoType, string> = {
  exterior: 'Exterior', interior: 'Interior', engine_bay: 'Engine bay',
  undercarriage: 'Undercarriage', odometer: 'Odometer', other: 'Other',
};

export function UnitGallery({ images, title }: { images: UnitImage[]; title: string }) {
  const sorted = useMemo(() => [...images].sort((a, b) => a.sort_order - b.sort_order), [images]);
  const types = useMemo(() => Array.from(new Set(sorted.map((i) => i.photo_type))), [sorted]);
  const [filter, setFilter] = useState<PhotoType | 'all'>('all');
  const visible = filter === 'all' ? sorted : sorted.filter((i) => i.photo_type === filter);
  const [index, setIndex] = useState(0);
  const current = visible[Math.min(index, visible.length - 1)];

  const step = useCallback((d: number) => {
    setIndex((i) => (visible.length ? (i + d + visible.length) % visible.length : 0));
  }, [visible.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  if (!sorted.length) return <GalleryPlaceholder title={title} />;

  return (
    <figure className="flex flex-col gap-3">
      <div className="group relative aspect-[4/3] overflow-hidden rounded-sm bg-surface ring-1 ring-line">
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt_text ?? `${title} — ${TYPE_LABEL[current.photo_type]}`}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
          style={{ animation: 'fadein 0.35s ease-out' }}
        />
        <span className="absolute left-3 top-3 rounded-sm bg-ink/75 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-paper">
          {TYPE_LABEL[current.photo_type]}
        </span>
        <span className="absolute bottom-3 right-3 rounded-sm bg-ink/75 px-2 py-1 text-xs font-semibold tabular-nums text-paper">
          {Math.min(index, visible.length - 1) + 1} / {visible.length}
        </span>
        {visible.length > 1 && (
          <>
            <NavButton side="left" onClick={() => step(-1)} />
            <NavButton side="right" onClick={() => step(1)} />
          </>
        )}
      </div>

      {types.length > 1 && (
        <div role="tablist" aria-label="Photo type" className="flex flex-wrap gap-1.5">
          {(['all', ...types] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={filter === t}
              onClick={() => { setFilter(t); setIndex(0); }}
              className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition-colors ${filter === t ? 'bg-ink text-paper' : 'border border-line text-sub hover:text-ink'}`}
            >
              {t === 'all' ? `All (${sorted.length})` : `${TYPE_LABEL[t]} (${sorted.filter((i) => i.photo_type === t).length})`}
            </button>
          ))}
        </div>
      )}

      {visible.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {visible.map((img, i) => (
            <li key={img.id} className="flex-none">
              <button
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                aria-current={i === index}
                className={`relative block aspect-[4/3] w-24 overflow-hidden rounded-sm transition-opacity ${i === index ? 'ring-2 ring-accent' : 'opacity-70 ring-1 ring-line hover:opacity-100'}`}
              >
                <Image src={img.url} alt="" fill loading="lazy" sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <figcaption className="sr-only">{title} photo gallery</figcaption>
    </figure>
  );
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous photo' : 'Next photo'}
      className={`absolute top-1/2 ${side === 'left' ? 'left-3' : 'right-3'} -translate-y-1/2 rounded-full bg-paper/90 p-2 text-ink opacity-0 shadow transition-opacity focus-visible:opacity-100 group-hover:opacity-100`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        {side === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}

function GalleryPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-line bg-surface text-center">
      <svg width="72" height="40" viewBox="0 0 72 40" fill="none" stroke="var(--color-sub)" strokeWidth="1.6" aria-hidden>
        <path d="M6 28h60M12 28l6-14h30l10 14M20 28a5 5 0 1 0 10 0a5 5 0 1 0-10 0M44 28a5 5 0 1 0 10 0a5 5 0 1 0-10 0" />
      </svg>
      <p className="text-sm font-medium text-ink">Photos for {title} are being prepared</p>
      <p className="max-w-xs text-xs text-sub">Request the full photo set and auction sheet below — we send them the same business day.</p>
    </div>
  );
}
