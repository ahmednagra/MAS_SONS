import { CategoryLanding } from '@/components/catalog/CategoryLanding';
import { cacheLife, cacheTag } from 'next/cache';
import { getStockFacetsServer, searchStockServer } from '@/services/stock/stock.server';

// Public landing: cached like every storefront page (CLAUDE.md), invalidated by the
// shared `stock` tag whenever any unit changes.
async function getCachedLanding() {
  'use cache';
  cacheLife('hours');
  cacheTag('stock');
  const [{ items }, facets] = await Promise.all([
    searchStockServer({ category: 'vehicle', limit: 24 }),
    getStockFacetsServer('vehicle'),
  ]);
  return { items, facets };
}

export const metadata = {
  title: 'Used Vehicles from Japan — M.A.S & SONS',
  description: 'Auction-graded sedans, SUVs, vans and kei-cars exported directly from Japan, LHD and RHD.',
};

export default async function VehiclesPage() {
  const { items, facets } = await getCachedLanding();
  return (
    <CategoryLanding
      category="vehicle"
      eyebrow="Vehicles"
      title="Sedans, SUVs, vans and kei-cars"
      description="LHD and RHD, auction-grade certified — every listing carries the real inspection sheet, not a description we wrote ourselves."
      facets={facets}
      units={items}
    />
  );
}
