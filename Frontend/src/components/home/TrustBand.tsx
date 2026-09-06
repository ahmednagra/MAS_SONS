import Link from 'next/link';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StatsBand } from './StatsBand';
import { Testimonials } from './Testimonials';
import { SITE } from '@/config/site';
import type { StockFacets } from '@/types/stock';
import type { Destination } from '@/types/destinations';
import type { Review } from '@/types/reviews';

/**
 * Numbers a buyer can check against the catalog, then people. Every stat is derived
 * from live data or a stated policy — nothing here is a marketing figure.
 */
export function TrustBand({
  facets,
  portCount,
  reviews,
  destinations,
}: {
  facets: StockFacets;
  portCount: number;
  reviews: Review[];
  destinations: Destination[];
}) {
  const stats = [
    { target: facets.vehicles, label: 'Vehicles in stock' },
    { target: facets.equipment, label: 'Machines in stock' },
    { target: portCount, label: 'Destination ports' },
    { target: 100, suffix: '%', label: 'Listings with auction sheet' },
  ];
  // Approved reviews only — the homepage never shows anything a moderator hasn't cleared,
  // and gracefully renders nothing if there are none yet rather than falling back to copy.
  const testimonials = reviews.map((r) => ({
    quote: r.body,
    name: r.reviewer_name,
    location: destinations.find((d) => d.country_code === r.destination_country)?.country_name ?? r.destination_country ?? '',
  }));

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20">
      <StatsBand stats={stats} />
      {testimonials.length > 0 && (
        <div className="mt-16">
          <SectionHeader
            eyebrow="Trust"
            title="Buyers who shipped with us"
            aside={
              <span className="font-mono text-[11px] font-normal text-sub">
                Licensed dealer · {SITE.license} ·{' '}
                <Link href="/verification" className="font-medium text-ink underline-offset-4 hover:underline">How to verify us</Link>
              </span>
            }
          />
          <Testimonials testimonials={testimonials} />
        </div>
      )}
    </section>
  );
}
