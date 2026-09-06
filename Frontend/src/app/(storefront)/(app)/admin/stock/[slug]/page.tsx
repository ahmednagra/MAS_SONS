import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getUnitBySlugServer } from '@/services/stock/stock.server';
import { SpecGrid } from '@/components/stock/SpecGrid';
import { InspectionSheet } from '@/components/stock/InspectionSheet';
import { PriceForm } from '../PriceForm';

// `params` is itself a request-time API under Cache Components, same as cookies() — it and the
// fetch it drives stay out of the page's top level and behind Suspense
// (docs/authentication-with-cache-components.md's "push dynamic access down").
async function UnitContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getUnitBySlugServer(slug);
  if (!unit) notFound();

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{unit.year} {unit.make} {unit.model}</h1>
      <SpecGrid unit={unit} />
      <InspectionSheet unit={unit} />
      <PriceForm unitId={unit.id} initialPrice={unit.price_usd} />
    </>
  );
}

// No admin-specific get-by-id route exists — the public GET /stock/{slug} is the same
// full UnitResponse an admin needs to see, so this reuses it. Staff-only mutation
// (PATCH /admin/stock/{id}/price) still requires the real numeric id, which the fetched
// unit already carries.
export default function AdminUnitPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-surface" />}>
        <UnitContent params={params} />
      </Suspense>
    </div>
  );
}
