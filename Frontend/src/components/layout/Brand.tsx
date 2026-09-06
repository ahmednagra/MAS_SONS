import Link from 'next/link';
import { SITE } from '@/config/site';

/**
 * Sun-disc monogram: a rust disc with "MS" cut out and a single horizon stroke beneath.
 * Below ~24px the horizon is dropped and the disc fills the box (see app/icon.svg).
 */
export function BrandMark({ size = 34, horizon = true, className = '' }: { size?: number; horizon?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" className={`flex-none ${className}`}>
      <circle cx="17" cy={horizon ? 16 : 17} r={horizon ? 13.5 : 16} fill="var(--color-accent)" />
      <text
        x="17" y={horizon ? 21 : 23} textAnchor="middle" fontSize={horizon ? 14 : 17} fontWeight="700" letterSpacing="-0.3"
        fill="var(--color-paper)" className="font-display" style={{ fontWeight: 700 }}
      >
        MS
      </text>
      {horizon && <path d="M3 32.5 H31" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

/** Wordmark lockup: mark + "MAS & SONS" in condensed bold with a rust ampersand + one descriptor line. */
export function Brand({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const footer = variant === 'footer';
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} — home`}
      className="inline-flex items-center gap-3 rounded-sm text-ink no-underline outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
    >
      <BrandMark size={footer ? 52 : 34} />
      <span className="flex flex-col leading-none">
        <span className={`font-display tracking-normal whitespace-nowrap ${footer ? 'text-[34px]' : 'text-[24px]'}`}
          style={{ fontWeight: 700 }}>
          MAS <span className="font-medium text-accent">&amp;</span> SONS
        </span>
        <span className={`mt-1.5 font-semibold uppercase tracking-[0.22em] text-sub ${footer ? 'text-[11px]' : 'text-[9.5px]'}`}>
          {footer ? `株式会社 · ${SITE.address}` : SITE.address.replace(/, /g, ' · ')}
        </span>
      </span>
    </Link>
  );
}
