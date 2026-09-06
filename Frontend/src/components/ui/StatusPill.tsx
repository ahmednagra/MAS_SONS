import type { UnitStatus } from '@/types/stock';

export const STOCK_STATUS_LABEL: Record<UnitStatus, string> = {
  in_stock: 'In stock',
  sourcing: 'Sourcing on request',
  sold: 'Sold',
};

export function StatusPill({ status }: { status: UnitStatus }) {
  return (
    <p className="inline-flex w-fit items-center gap-1.5 rounded-sm border border-line px-3 py-1.5 text-sm font-medium text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'in_stock' ? 'bg-accent' : 'bg-sub'}`} aria-hidden />
      {STOCK_STATUS_LABEL[status]}
    </p>
  );
}
