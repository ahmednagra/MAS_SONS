import { CategoryLanding, headingFromFacets } from '@/components/catalog/CategoryLanding';
import { listDestinationsServer } from '@/services/destinations';
import { cacheLife, cacheTag } from 'next/cache';
import { getStockFacetsServer, searchStockServer } from '@/services/stock/stock.server';

// Public landing: cached like every storefront page (CLAUDE.md), invalidated by the
// shared `stock` tag whenever any unit changes.
async function getCachedLanding() {
  'use cache';
  cacheLife('hours');
  cacheTag('stock');
  const [{ items }, facets, destinations] = await Promise.all([
    searchStockServer({ category: 'vehicle', limit: 24 }),
    getStockFacetsServer('vehicle'),
    listDestinationsServer().catch(() => []),
  ]);
  return { items, facets, destinations };
}

export const metadata = {
  title: 'Used Vehicles from Japan — M.A.S & SONS',
  description: 'Auction-graded sedans, SUVs, vans and kei-cars exported directly from Japan, LHD and RHD.',
};

export default async function VehiclesPage() {
  const { items, facets, destinations } = await getCachedLanding();
  return (
    <CategoryLanding
      category="vehicle"
      eyebrow="Vehicles"
      title={headingFromFacets(facets, "Used vehicles from Japan")}
      description="LHD and RHD, auction-grade certified — every listing carries the real inspection sheet, not a description we wrote ourselves."
      facets={facets}
      units={items}
      destinations={destinations}
    />
  );
}
