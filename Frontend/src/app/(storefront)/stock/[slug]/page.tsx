import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { getUnitBySlugServer } from '@/services/stock/stock.server';
import { UnitGallery } from '@/components/stock/UnitGallery';
import { UnitDetails } from '@/components/stock/UnitDetails';
import { LiveStockStatus } from '@/components/stock/LiveStockStatus';

async function getCachedUnit(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`unit:${slug}`);
  return getUnitBySlugServer(slug);
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getCachedUnit(slug);
  if (!unit) notFound();

  return (
    <article className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 sm:grid-cols-2">
      <UnitGallery images={unit.images} />
      <div className="flex flex-col gap-4">
        <UnitDetails unit={unit} />
        <Suspense fallback={<p className="text-sm text-sub">Checking availability…</p>}>
          <LiveStockStatus slug={slug} />
        </Suspense>
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getCachedUnit(slug);
  if (!unit) return {};
  return {
    title: `${unit.year} ${unit.make} ${unit.model} — $${unit.price.toLocaleString('en-US')} FOB Japan`,
    description: unit.description.slice(0, 155),
    openGraph: { images: unit.images[0] ? [unit.images[0].url] : [] },
  };
}
