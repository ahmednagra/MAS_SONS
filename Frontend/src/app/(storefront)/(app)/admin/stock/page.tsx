import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { stockListOptions } from '@/hooks/queries';
import { StockTable } from '@/components/admin/StockTable';

export default async function AdminStockPage() {
  const qc = getQueryClient();
  await qc.prefetchQuery(stockListOptions({}));
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <StockTable />
    </HydrationBoundary>
  );
}
