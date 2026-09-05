'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStockList } from '@/hooks/queries';
import { Table, TableHead, TableHeaderCell, TableRow, TableCell, Pagination } from '@/components/ui';

const PAGE_SIZE = 20;

export function StockTable() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const { data, isLoading, isError } = useStockList({ page, limit: PAGE_SIZE });

  if (isLoading) return <p className="text-sub">Loading…</p>;
  if (isError || !data) return <p className="text-accent">Failed to load stock.</p>;

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHead>
          <TableHeaderCell>Unit</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableHead>
        <tbody>
          {data.items.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell>
                <Link href={`/admin/stock/${unit.id}`} className="font-medium text-ink hover:text-accent">
                  {unit.year} {unit.make} {unit.model}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">${unit.price.toLocaleString('en-US')}</TableCell>
              <TableCell className="capitalize">{unit.status.replace('_', ' ')}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(data.total / PAGE_SIZE))} hrefForPage={(p) => `/admin/stock?page=${p}`} />
    </div>
  );
}
