'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStockList } from '@/hooks/queries';
import { Button, Table, TableHead, TableHeaderCell, TableRow, TableCell } from '@/components/ui';

const PAGE_SIZE = 20;

export function StockTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cursor = searchParams.get('cursor') ? Number(searchParams.get('cursor')) : undefined;
  const { data, isLoading, isError } = useStockList({ cursor, limit: PAGE_SIZE });

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
                <Link href={`/admin/stock/${unit.slug}`} className="font-medium text-ink hover:text-accent">
                  {unit.year} {unit.make} {unit.model}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">${unit.price_usd.toLocaleString('en-US')}</TableCell>
              <TableCell className="capitalize">{unit.status.replace('_', ' ')}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      {data.next_cursor != null && (
        <nav className="flex justify-center">
          <Button variant="secondary" onClick={() => router.push(`/admin/stock?cursor=${data.next_cursor}`)}>
            Next →
          </Button>
        </nav>
      )}
    </div>
  );
}
