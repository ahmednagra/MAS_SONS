import { Suspense } from 'react';
import { Hero } from '@/components/home/Hero';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';
import { SourcingTeaser } from '@/components/home/SourcingTeaser';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import { searchStockServer } from '@/services/stock/stock.server';

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">In stock this week</h2>
        <Suspense fallback={<p className="text-sub">Loading stock…</p>}>
          <FeaturedStock />
        </Suspense>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <SourcingTeaser />
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">How buying works</h2>
        <HowItWorksSteps />
      </section>
    </main>
  );
}

async function FeaturedStock() {
  const { items } = await searchStockServer({ limit: 8 });
  return <ResultsGrid units={items} />;
}
