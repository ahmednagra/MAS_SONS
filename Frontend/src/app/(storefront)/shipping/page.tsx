import { PageHeader } from '@/components/layout/PageHeader';
import { ShippingMap } from '@/components/home/ShippingMap';
import { MOCK_SHIPPING_LANES } from '@/lib/mock-data/units';

export const metadata = {
  title: 'Shipping — M.A.S & SONS',
  description: 'RoRo vs. container, Incoterms explained, and the document set that ships with every unit exported from Japan.',
};

const INCOTERMS = [
  { term: 'FOB', name: 'Free On Board', note: 'You arrange and pay for ocean freight and insurance from the Japanese port. We handle everything up to loading.' },
  { term: 'C&F / CFR', name: 'Cost and Freight', note: 'Ocean freight to your destination port is included in the price. Insurance is still yours to arrange.' },
  { term: 'CIF', name: 'Cost, Insurance and Freight', note: 'Freight and marine insurance to your destination port are both included in the quoted price.' },
];

const DOCUMENTS = [
  { name: 'Export Certificate', note: 'Confirms the vehicle or equipment has been formally deregistered for export from Japan.' },
  { name: 'Bill of Lading (B/L)', note: 'The shipping document — required to claim the unit at your destination port.' },
  { name: 'Commercial Invoice', note: 'States the agreed price and Incoterm, needed for customs valuation.' },
];

export default function ShippingPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16">
      <PageHeader
        eyebrow="Logistics"
        title="From a Japanese port to yours"
        description="Every quote is priced as FOB, C&F or CIF — pick the term that matches how much of the journey you want us to arrange."
      />

      <section className="mb-14">
        <ShippingMap lanes={MOCK_SHIPPING_LANES} />
      </section>

      <section className="mb-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-ink">Incoterms, plainly</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {INCOTERMS.map((t) => (
            <div key={t.term} className="border border-line bg-surface p-5">
              <p className="text-lg font-semibold text-accent">{t.term}</p>
              <p className="mt-1 text-sm font-semibold text-ink">{t.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-sub">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-ink">RoRo or container?</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-line bg-paper p-5">
            <p className="text-sm font-semibold text-ink">RoRo (roll-on/roll-off)</p>
            <p className="mt-2 text-sm leading-relaxed text-sub">The standard method for a single vehicle — it is driven directly onto the vessel. Faster to book, generally the lower-cost option for one unit.</p>
          </div>
          <div className="border border-line bg-paper p-5">
            <p className="text-sm font-semibold text-ink">Container</p>
            <p className="mt-2 text-sm leading-relaxed text-sub">Used for heavy equipment, multiple units in one shipment, or destinations without regular RoRo service. Offers more protection in transit.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-ink">What ships with your unit</h2>
        <dl className="grid gap-4 sm:grid-cols-3">
          {DOCUMENTS.map((doc) => (
            <div key={doc.name} className="border-t-2 border-accent pt-3">
              <dt className="text-sm font-semibold text-ink">{doc.name}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-sub">{doc.note}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-sub">
          Customs clearance and any import duty in your destination country are the buyer&rsquo;s responsibility.
        </p>
      </section>
    </main>
  );
}
