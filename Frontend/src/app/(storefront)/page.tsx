import { Hero } from '@/components/home/Hero';
import { StatsBand } from '@/components/home/StatsBand';
import { GradeDistributionChart } from '@/components/home/GradeDistributionChart';
import { StockSplitDonut } from '@/components/home/StockSplitDonut';
import { ShippingMap } from '@/components/home/ShippingMap';
import { HowItWorksSteps } from '@/components/home/HowItWorksSteps';
import { SourcingTeaser } from '@/components/home/SourcingTeaser';
import { Testimonials } from '@/components/home/Testimonials';
import { ResultsGrid } from '@/components/stock/ResultsGrid';
import {
  MOCK_UNITS, MOCK_STATS, MOCK_STOCK_SPLIT, MOCK_GRADE_DIST, MOCK_SHIPPING_LANES, MOCK_TESTIMONIALS,
} from '@/lib/mock-data/units';

export default function HomePage() {
  const stats = [
    { target: MOCK_STATS.unitsInStock, label: 'Units in stock' },
    { target: MOCK_STATS.countriesServed, label: 'Countries served' },
    { target: MOCK_STATS.gradeVerifiedPct, suffix: '%', label: 'Grade-verified' },
    { target: MOCK_STATS.shippingPorts, label: 'Shipping ports' },
  ];

  return (
    <main>
      <Hero />
      <StatsBand stats={stats} />

      <section className="mx-auto grid max-w-[1200px] gap-5 px-4 py-14 sm:grid-cols-2">
        <GradeDistributionChart distribution={MOCK_GRADE_DIST} />
        <StockSplitDonut vehicles={MOCK_STOCK_SPLIT.vehicles} equipment={MOCK_STOCK_SPLIT.equipment} />
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">In stock this week</h2>
            <p className="mt-1 text-sm text-sub">Eight of {MOCK_STATS.unitsInStock.toLocaleString('en-US')} units — full catalog updates daily.</p>
          </div>
        </div>
        <ResultsGrid units={MOCK_UNITS} />
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">Where we ship</h2>
        <ShippingMap lanes={MOCK_SHIPPING_LANES} />
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <SourcingTeaser />
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">How buying works</h2>
        <HowItWorksSteps />
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">What buyers say</h2>
        <Testimonials testimonials={MOCK_TESTIMONIALS} />
      </section>
    </main>
  );
}
