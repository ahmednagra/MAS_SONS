import { cacheLife, cacheTag } from 'next/cache';
import { getDestinationInfoServer } from '@/services/destinations';
import { searchStockServer } from '@/services/stock/stock.server';
import { ShippingGuide } from '@/components/destinations/ShippingGuide';
import { ResultsGrid } from '@/components/stock/ResultsGrid';

async function getCachedDestination(country: string) {
  'use cache';
  cacheLife('days');
  cacheTag(`destination:${country}`);
  const info = await getDestinationInfoServer(country);
  // No per-unit shipping restriction exists in the schema yet — every unit ships
  // everywhere, so this is a general stock sample, not one filtered by destination.
  const { items } = await searchStockServer({ limit: 24 });
  return { info, featured: items };
}

export default async function DestinationPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const { info, featured } = await getCachedDestination(country);
  return (
    <div>
      <ShippingGuide info={info} />
      <ResultsGrid units={featured} />
    </div>
  );
}
