import { CategoryLanding } from '@/components/catalog/CategoryLanding';
import { MOCK_UNITS } from '@/lib/mock-data/units';

export const metadata = {
  title: 'Used Vehicles from Japan — M.A.S & SONS',
  description: 'Auction-graded sedans, SUVs, vans and kei-cars exported directly from Japan, LHD and RHD.',
};

export default function VehiclesPage() {
  return (
    <CategoryLanding
      category="vehicle"
      eyebrow="Vehicles"
      title="Sedans, SUVs, vans and kei-cars"
      description="LHD and RHD, auction-grade certified — every listing carries the real inspection sheet, not a description we wrote ourselves."
      subtypes={['Sedans', 'SUVs · 4x4', 'Vans', 'Kei-cars & hatchbacks']}
      units={MOCK_UNITS.filter((u) => u.category === 'vehicle')}
    />
  );
}
