import { Suspense } from 'react';
import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { getUnitBySlugServer, getUnitInsightsServer } from '@/services/stock/stock.server';
import { UnitGallery } from '@/components/stock/UnitGallery';
import { UnitSummaryPanel } from '@/components/stock/UnitSummaryPanel';
import { SpecGrid } from '@/components/stock/SpecGrid';
import { MarketPositionPanel } from '@/components/stock/MarketPositionPanel';
import { GradeScale } from '@/components/stock/GradeScale';
import { InspectionSheet } from '@/components/stock/InspectionSheet';
import { EquipmentMatrix } from '@/components/stock/EquipmentMatrix';
import { ShippingEstimator } from '@/components/stock/ShippingEstimator';
import { QuoteForm } from '@/components/stock/QuoteForm';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import { UnitFaq } from '@/components/stock/UnitFaq';
import { UnitJsonLd } from '@/components/stock/UnitJsonLd';
import { formatUsd } from '@/lib/format';

async function getCachedUnit(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`unit:${slug}`);
  return getUnitBySlugServer(slug);
}

// Peer stats and comparables depend on the rest of the catalog, so they carry the
// shared `stock` tag as well — any stock mutation refreshes every unit's insights.
async function getCachedInsights(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`unit:${slug}`, 'stock');
  return getUnitInsightsServer(slug);
}

// Route params are runtime data under Cache Components: awaiting them at the page
// root would block the static shell (Next.js E1427). The shell streams instantly
// with a skeleton and the unit body fills in from the cached fetches.
export default function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<UnitSkeleton />}>
      <UnitBody params={params} />
    </Suspense>
  );
}

async function UnitBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [unit, insights] = await Promise.all([getCachedUnit(slug), getCachedInsights(slug)]);
  if (!unit) notFound();

  const title = `${unit.year} ${unit.make} ${unit.model}`;
  const catalogHref = unit.category === 'vehicle' ? '/vehicles' : '/equipment';
  const destinations = insights?.destinations ?? [];

  return (
    <article className="mx-auto flex max-w-[1200px] flex-col gap-14 px-4 py-8 sm:py-10">
      <UnitJsonLd unit={unit} />

      <div className="flex flex-col gap-6">
        <nav aria-label="Breadcrumb" className="text-xs text-sub">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href="/" className="hover:text-ink">Home</Link> /</li>
            <li><Link href={catalogHref} className="hover:text-ink">{unit.category === 'vehicle' ? 'Vehicles' : 'Equipment'}</Link> /</li>
            <li><Link href={`/stock?make=${encodeURIComponent(unit.make)}`} className="hover:text-ink">{unit.make}</Link> /</li>
            <li aria-current="page" className="text-ink">{unit.model}</li>
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
          <UnitGallery images={unit.images} title={title} />
          <div className="lg:sticky lg:top-24 lg:self-start">
            <UnitSummaryPanel unit={unit} market={insights?.market ?? null} />
          </div>
        </div>
      </div>

      <SpecGrid unit={unit} />

      {insights && <MarketPositionPanel unit={unit} market={insights.market} points={insights.price_points} />}

      <section aria-labelledby="inspection-heading" className="flex flex-col gap-4">
        <h2 id="inspection-heading" className="text-2xl font-semibold tracking-tight text-ink">Inspection &amp; condition</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <GradeScale grade={unit.auction_grade} />
          <InspectionSheet unit={unit} />
        </div>
        {unit.description && unit.description !== title && (
          <p className="max-w-3xl text-sm leading-relaxed text-sub">{unit.description}</p>
        )}
      </section>

      <EquipmentMatrix confirmed={unit.features} catalog={insights?.feature_catalog ?? []} />

      <ShippingEstimator destinations={destinations} originPort={unit.port} />

      <section id="quote" aria-labelledby="quote-heading" className="scroll-mt-24 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Landed-cost quotation</p>
          <h2 id="quote-heading" className="mt-2 text-2xl font-semibold tracking-tight text-ink">Get the delivered price for this {unit.make}</h2>
          <p className="mt-3 text-sm leading-relaxed text-sub">
            Vehicle {formatUsd(unit.price_usd)} FOB {unit.port}. Tell us the port and terms and we return an itemised quotation — freight, insurance, inspection, documents — within one business day.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-sm text-ink">
            {['Reply within 1 business day (JST)', 'Auction sheet & extra photos on request', 'No payment until you approve the pro-forma'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden><path d="M5 13l4 4L19 7" /></svg>{t}
              </li>
            ))}
          </ul>
        </div>
        <QuoteForm unitId={unit.id} unitTitle={title} destinations={destinations} />
      </section>

      {insights && insights.comparables.length > 0 && (
        <section aria-labelledby="similar-heading">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="similar-heading" className="text-2xl font-semibold tracking-tight text-ink">
              {insights.market.scope === 'model' ? `More ${unit.make} ${unit.model} in stock` : `Similar ${unit.category === 'vehicle' ? 'vehicles' : 'equipment'} in stock`}
            </h2>
            <Link href={`/stock?make=${encodeURIComponent(unit.make)}`} className="text-sm font-semibold text-accent hover:underline">View all {unit.make} →</Link>
          </div>
          <Suspense fallback={null}>
            <ResultsGrid units={insights.comparables} />
          </Suspense>
        </section>
      )}

      <UnitFaq unit={unit} />
    </article>
  );
}

function UnitSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:py-10" aria-busy aria-label="Loading unit">
      <div className="h-3 w-48 rounded-sm bg-line" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <div className="aspect-[4/3] rounded-sm bg-line" />
        <div className="flex flex-col gap-4">
          <div className="h-5 w-40 rounded-sm bg-line" />
          <div className="h-9 w-3/4 rounded-sm bg-line" />
          <div className="h-4 w-1/2 rounded-sm bg-line" />
          <div className="h-44 rounded-sm bg-line" />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getCachedUnit(slug);
  if (!unit) return {};
  const title = `${unit.year} ${unit.make} ${unit.model}`;
  const usage = unit.category === 'vehicle' && unit.mileage_km != null ? `${unit.mileage_km.toLocaleString('en-US')} km` : unit.operating_hours != null ? `${unit.operating_hours.toLocaleString('en-US')} hrs` : null;
  const description = [
    `${title} for export from Japan — ${formatUsd(unit.price_usd)} FOB ${unit.port}.`,
    `Auction grade ${unit.auction_grade}${unit.repair_history ? '' : ', no repair history'}.`,
    usage, unit.steering_position, unit.transmission, unit.fuel_type,
  ].filter(Boolean).join(' · ').slice(0, 155);
  return {
    title: `${title} — ${formatUsd(unit.price_usd)} FOB Japan | M.A.S & SONS`,
    description,
    openGraph: { title, description, images: unit.images[0] ? [unit.images[0].url] : [] },
  };
}
