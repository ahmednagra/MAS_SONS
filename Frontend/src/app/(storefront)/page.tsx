import { cacheLife, cacheTag } from 'next/cache';
import { Hero } from '@/components/home/Hero';
import { BrandStrip } from '@/components/home/BrandStrip';
import { CategoryCarousel, type CategoryCard } from '@/components/home/CategoryCarousel';
import { DestinationBand } from '@/components/home/DestinationBand';
import { TrustBand } from '@/components/home/TrustBand';
import { PaymentSafety } from '@/components/home/PaymentSafety';
import { SourcingTeaser } from '@/components/home/SourcingTeaser';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';
import { HomeFaq } from '@/components/home/HomeFaq';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StockRail } from '@/components/stock/StockRail';
import { getStockFacetsServer, searchStockServer } from '@/services/stock/stock.server';
import { listDestinationsServer } from '@/services/destinations';
import { listApprovedReviewsServer } from '@/services/reviews';

const RAIL_SIZE = 8;

// One cached unit of work for the whole page — public, identical for every visitor.
// `stock` is refreshed by admin mutations (updateTag), `destinations` by the
// destinations admin; the hourly cacheLife is the backstop.
async function getHomeData() {
  'use cache';
  cacheLife('hours');
  cacheTag('stock', 'destinations');

  const [facets, arrivals, equipment, destinations, reviews] = await Promise.all([
    getStockFacetsServer(),
    searchStockServer({ category: 'vehicle', limit: RAIL_SIZE }),
    searchStockServer({ category: 'equipment', limit: RAIL_SIZE }),
    listDestinationsServer(),
    // Approved reviews are moderated infrequently; don't break the homepage if there are
    // none yet or the call fails — the trust section just renders nothing in that case.
    listApprovedReviewsServer({ limit: 6 }).catch(() => []),
  ]);

  // One representative photo per body type for the category carousel — a handful of
  // small queries on an indexed column, all inside this hourly cache. A few rows are
  // sampled so a unit without photos does not leave the card blank.
  const samples = await Promise.all(facets.body_types.map((b) => searchStockServer({ body_type: b.value, limit: 6 })));
  const categories: CategoryCard[] = facets.body_types.map((b, i) => ({
    value: b.value,
    count: b.count,
    image: samples[i].items.find((u) => u.thumbnail_url)?.thumbnail_url ?? null,
  }));

  // Clock reads happen inside the cache so the rendered page stays a pure function of
  // its data — "New" badges are recomputed on each revalidation.
  const nowMs = Date.now();
  return { facets, categories, arrivals: arrivals.items, equipment: equipment.items, destinations, reviews, nowMs };
}

export default async function HomePage() {
  const { facets, categories, arrivals, equipment, destinations, reviews, nowMs } = await getHomeData();

  return (
    <main>
      <Hero facets={facets} />

      <BrandStrip makes={facets.makes} />

      <CategoryCarousel categories={categories} />

      <div className="bg-surface">
        <StockRail
          eyebrow="Vehicles"
          title="New arrivals"
          description="Grade, mileage and steering on every card. Prices are FOB the Japanese port shown."
          href="/stock?category=vehicle"
          units={arrivals}
          destinations={destinations}
          nowMs={nowMs}
          priorityCount={2}
        />
        <StockRail
          eyebrow="Heavy equipment"
          title="Excavators, loaders, tractors and forklifts"
          description="Hour readings and attachments listed; container or RoRo recommended per unit."
          href="/stock?category=equipment"
          units={equipment}
          destinations={destinations}
          nowMs={nowMs}
        />
      </div>

      <DestinationBand destinations={destinations} />

      <div className="bg-surface">
        <TrustBand facets={facets} portCount={destinations.length} reviews={reviews} destinations={destinations} />
      </div>

      <PaymentSafety />

      <div className="bg-surface">
        <section className="mx-auto max-w-[1200px] px-4 py-20">
          <SourcingTeaser />
        </section>
      </div>

      <section className="mx-auto max-w-[1200px] px-4 py-20">
        <SectionHeader eyebrow="Process" title="How buying works" description="The same six steps for a unit in stock or one we source at auction." />
        <HowItWorksSteps />
      </section>

      <div className="bg-surface">
        <HomeFaq />
      </div>
    </main>
  );
}
