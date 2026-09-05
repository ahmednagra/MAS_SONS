import { CategoryLanding } from '@/components/catalog/CategoryLanding';
import { MOCK_UNITS } from '@/lib/mock-data/units';

export const metadata = {
  title: 'Heavy Equipment from Japan — M.A.S & SONS',
  description: 'Auction-graded excavators, wheel loaders, tractors and forklifts exported directly from Japan.',
};

export default function EquipmentPage() {
  return (
    <CategoryLanding
      category="equipment"
      eyebrow="Heavy equipment"
      title="Excavators, loaders, tractors and forklifts"
      description="Inspected and graded the same way as our vehicles — a real auction sheet with operating hours, not an estimate."
      subtypes={['Excavators', 'Wheel loaders', 'Tractors', 'Forklifts']}
      units={MOCK_UNITS.filter((u) => u.category === 'equipment')}
    />
  );
}
