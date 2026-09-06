import Link from 'next/link';
import { SITE, telHref, whatsappHref } from '@/config/site';
import { JapanClock } from './JapanClock';
import { DestinationPicker } from './DestinationPicker';
import type { Destination } from '@/types/destinations';

/**
 * Thin line above the header: where we are, when we answer, how to reach us, and
 * the two things an international buyer sets once — destination port and language.
 */
export function UtilityBar({ destinations }: { destinations: Destination[] }) {
  return (
    <div className="border-b border-line bg-surface text-xs text-sub">
      <div className="mx-auto flex min-h-[34px] max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1">
        <JapanClock />
        <span className="hidden sm:inline">USD pricing · FOB, C&amp;F or CIF to your port</span>

        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1">
          {SITE.phone && (
            <a href={telHref(SITE.phone)} className="hidden font-medium text-ink md:inline">{SITE.phone}</a>
          )}
          {SITE.whatsapp && (
            <a href={whatsappHref(SITE.whatsapp)} target="_blank" rel="noopener" className="font-medium text-ink">
              WhatsApp
            </a>
          )}
          {SITE.email && (
            <a href={`mailto:${SITE.email}`} className="hidden font-medium text-ink lg:inline">{SITE.email}</a>
          )}
          <DestinationPicker destinations={destinations} />
          <Link href={SITE.jpSiteHref} lang="ja" hrefLang="ja" className="font-medium text-ink">
            日本語 · 車を売る
          </Link>
        </div>
      </div>
    </div>
  );
}
