import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUnitServer } from '@/services/stock/stock.server';
import { UnitDetails } from '@/components/stock/UnitDetails';
import { PriceForm } from '../PriceForm';

export default async function AdminUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authToken = (await cookies()).get('access_token')?.value;
  if (!authToken) redirect('/login');

  const unit = await getUnitServer(id, authToken);
  return (
    <div>
      <UnitDetails unit={unit} />
      <PriceForm unitId={id} />
    </div>
  );
}
