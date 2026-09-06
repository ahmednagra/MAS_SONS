import { getUnitBySlugServer } from '@/services/stock/stock.server';
import { StatusPill } from '@/components/ui';

export async function LiveStockStatus({ slug }: { slug: string }) {
  const unit = await getUnitBySlugServer(slug);
  if (!unit) return null;
  return <StatusPill status={unit.status} />;
}
