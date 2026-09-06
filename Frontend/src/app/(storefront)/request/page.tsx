import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { PageHeader } from '@/components/layout/PageHeader';
import { listDestinationsServer } from '@/services/destinations';
import { RequestForm, type RequestPrefill } from './RequestForm';

export const metadata = {
  title: 'Request a Quote or Sourcing — M.A.S & SONS',
  description: 'Ask for an FOB, C&F or CIF quote on a unit in stock, or tell us what to find at Japanese auction. No account needed.',
};

type RawParams = Record<string, string | string[] | undefined>;

async function getDestinations() {
  'use cache';
  cacheLife('days');
  cacheTag('destinations');
  return listDestinationsServer();
}

const str = (v: string | string[] | undefined, max = 120) => (typeof v === 'string' ? v.slice(0, max) : undefined);

export default function RequestPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  return (
    <main className="mx-auto max-w-[880px] px-4 py-16">
      <PageHeader
        eyebrow="Quote & sourcing"
        title="Tell us what you need. We reply with the real sheet."
        description="One form for both cases: a quote on a unit already in stock, or a brief for us to bid on at Japanese auction. Either way you see the inspector's sheet and a written price before you commit."
      />
      <Suspense fallback={<div className="h-[32rem] rounded-sm border border-line bg-surface" aria-busy />}>
        <RequestFormLoader searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function RequestFormLoader({ searchParams }: { searchParams: Promise<RawParams> }) {
  const [params, destinations] = await Promise.all([searchParams, getDestinations()]);
  const prefill: RequestPrefill = {
    make: str(params.make, 60),
    model: str(params.model),
    destination: str(params.destination, 2)?.toUpperCase(),
    unit: str(params.unit, 200),
  };
  return <RequestForm destinations={destinations} prefill={prefill} />;
}
