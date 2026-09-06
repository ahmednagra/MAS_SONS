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
    searchStockServer({ category: 'equipment', limit: 24 }),
    getStockFacetsServer('equipment'),
    listDestinationsServer().catch(() => []),
  ]);
  return { items, facets, destinations };
}

export const metadata = {
  title: 'Heavy Equipment from Japan — M.A.S & SONS',
  description: 'Auction-graded excavators, wheel loaders, tractors and forklifts exported directly from Japan.',
};

export default async function EquipmentPage() {
  const { items, facets, destinations } = await getCachedLanding();
  return (
    <CategoryLanding
      category="equipment"
      eyebrow="Heavy equipment"
      title={headingFromFacets(facets, "Heavy equipment from Japan")}
      description="Inspected and graded the same way as our vehicles — a real auction sheet with operating hours, not an estimate."
      facets={facets}
      units={items}
      destinations={destinations}
    />
  );
}
