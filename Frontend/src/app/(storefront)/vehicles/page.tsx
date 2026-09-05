import { CategoryLanding } from '@/components/catalog/CategoryLanding';
import { searchStockServer } from '@/services/stock/stock.server';

export const metadata = {
  title: 'Used Vehicles from Japan — M.A.S & SONS',
  description: 'Auction-graded sedans, SUVs, vans and kei-cars exported directly from Japan, LHD and RHD.',
};

export default async function VehiclesPage() {
  const { items } = await searchStockServer({ category: 'vehicle', limit: 24 });
  return (
    <CategoryLanding
      category="vehicle"
      eyebrow="Vehicles"
      title="Sedans, SUVs, vans and kei-cars"
      description="LHD and RHD, auction-grade certified — every listing carries the real inspection sheet, not a description we wrote ourselves."
      subtypes={['Sedans', 'SUVs · 4x4', 'Vans', 'Kei-cars & hatchbacks']}
      units={items}
    />
  );
}
