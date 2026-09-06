'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';

export interface CategoryCard {
  value: string;
  count: number;
  /** A real photo from one unit of this body type; null renders a quiet placeholder. */
  image: string | null;
}

/**
 * Horizontal snap-scroll row of body-type cards with side arrows on wide screens.
 * Swipe on phones. Each card is a filtered stock URL.
 */
export function CategoryCarousel({ categories }: { categories: CategoryCard[] }) {
  const track = useRef<HTMLUListElement>(null);
  if (!categories.length) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-14" aria-labelledby="categories-heading">
      <h2 id="categories-heading" className="font-display mb-6 text-[1.6rem] leading-none text-ink">Explore our categories</h2>

      <div className="relative">
        <ArrowButton dir={-1} onClick={() => scrollBy(-1)} />
        <ul
          ref={track}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
        >
          {categories.map((c) => (
            <li key={c.value} className="w-[58vw] max-w-[260px] shrink-0 snap-start sm:w-[232px] lg:w-[260px]">
              <Link
                href={`/stock?body_type=${encodeURIComponent(c.value)}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-md bg-[#ececee] dark:bg-[#23272f]"
              >
                {c.image ? (
                  <SafeImage
                    src={c.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 60vw, 260px"
                    className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
                    fallback={<CategoryPlaceholder />}
                  />
                ) : (
                  <CategoryPlaceholder />
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1b2027] shadow-sm">
                  {c.value}
                </span>
                <span className="absolute bottom-3 right-3 rounded-full bg-[#1b2027]/80 px-2 py-0.5 font-mono text-[11px] tabular-nums text-white">
                  {c.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <ArrowButton dir={1} onClick={() => scrollBy(1)} />
      </div>
    </section>
  );
}

function CategoryPlaceholder() {
  return (
    <span aria-hidden className="absolute inset-0 flex items-center justify-center text-line">
      <svg viewBox="0 0 48 40" className="h-12 w-14 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 30h40v-7l-6-2-6-8H16l-6 8-6 2v7Zm8 0a4 4 0 1 0 0 .01M36 30a4 4 0 1 0 0 .01" />
      </svg>
    </span>
  );
}

function ArrowButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? 'Scroll categories right' : 'Scroll categories left'}
      className={`absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-sm transition-colors hover:bg-paper md:flex ${
        dir === 1 ? '-right-4 xl:-right-12' : '-left-4 xl:-left-12'
      }`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={dir === 1 ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'} />
      </svg>
    </button>
  );
}
