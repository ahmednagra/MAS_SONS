import { getUnitBySlugServer } from '@/services/stock/stock.server';

const LABEL: Record<string, string> = { in_stock: 'In stock', sourcing: 'Sourcing on request', sold: 'Sold' };

export async function LiveStockStatus({ slug }: { slug: string }) {
  const unit = await getUnitBySlugServer(slug);
  if (!unit) return null;
  return (
    <p className="inline-flex w-fit items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      {LABEL[unit.status]}
    </p>
  );
}
