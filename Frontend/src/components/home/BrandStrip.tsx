import Link from 'next/link';
import type { FacetCount } from '@/types/stock';

/**
 * Continuous strip of make wordmarks under the hero. Typographic on purpose — brand
 * logos are trademarks we do not own and would need per-brand assets. The list is
 * rendered twice so the CSS marquee loops seamlessly; it pauses on hover and the
 * global reduced-motion rule turns it into a static row.
 */
export function BrandStrip({ makes }: { makes: FacetCount[] }) {
  if (makes.length < 4) return null;
  const items = [...makes, ...makes];
  return (
    <section aria-label="Makes in stock" className="bg-surface">
      <div className="mx-auto max-w-[1200px] overflow-hidden px-4 pb-10 pt-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <ul className="marquee flex w-max items-center gap-14 hover:[animation-play-state:paused]">
          {items.map((m, i) => (
            <li key={`${m.value}-${i}`} aria-hidden={i >= makes.length}>
              <Link
                href={`/stock?make=${encodeURIComponent(m.value)}`}
                tabIndex={i >= makes.length ? -1 : undefined}
                className="whitespace-nowrap font-mono text-[13px] font-medium uppercase tracking-[0.28em] text-sub/55 transition-colors hover:text-ink"
              >
                {m.value}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
