import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import { Button } from '@/components/ui';
import type { Unit, UnitCategory } from '@/types/stock';

export function CategoryLanding({
  category, eyebrow, title, description, subtypes, units,
}: {
  category: UnitCategory;
  eyebrow: string;
  title: string;
  description: string;
  subtypes: string[];
  units: Unit[];
}) {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mb-12 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {subtypes.map((s) => (
          <div key={s} className="border border-line bg-paper p-4 text-center text-sm font-medium text-ink">{s}</div>
        ))}
      </div>

      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Current stock</h2>
        <Link href={`/stock?category=${category}`}><Button variant="secondary">Browse all →</Button></Link>
      </div>
      <ResultsGrid units={units} />
    </main>
  );
}
