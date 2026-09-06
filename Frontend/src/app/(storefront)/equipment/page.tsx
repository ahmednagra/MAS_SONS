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
    searchStockServer({ category: 'equipment', limit: 24 }),
    getStockFacetsServer('equipment'),
  ]);
  return { items, facets };
}

export const metadata = {
  title: 'Heavy Equipment from Japan — M.A.S & SONS',
  description: 'Auction-graded excavators, wheel loaders, tractors and forklifts exported directly from Japan.',
};

export default async function EquipmentPage() {
  const { items, facets } = await getCachedLanding();
  return (
    <CategoryLanding
      category="equipment"
      eyebrow="Heavy equipment"
      title="Excavators, loaders, tractors and forklifts"
      description="Inspected and graded the same way as our vehicles — a real auction sheet with operating hours, not an estimate."
      facets={facets}
      units={items}
    />
  );
}
