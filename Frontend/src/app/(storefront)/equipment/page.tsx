import { CategoryLanding } from '@/components/catalog/CategoryLanding';
import { searchStockServer } from '@/services/stock/stock.server';

export const metadata = {
  title: 'Heavy Equipment from Japan — M.A.S & SONS',
  description: 'Auction-graded excavators, wheel loaders, tractors and forklifts exported directly from Japan.',
};

export default async function EquipmentPage() {
  const { items } = await searchStockServer({ category: 'equipment', limit: 24 });
  return (
    <CategoryLanding
      category="equipment"
      eyebrow="Heavy equipment"
      title="Excavators, loaders, tractors and forklifts"
      description="Inspected and graded the same way as our vehicles — a real auction sheet with operating hours, not an estimate."
      subtypes={['Excavators', 'Wheel loaders', 'Tractors', 'Forklifts']}
      units={items}
    />
  );
}
