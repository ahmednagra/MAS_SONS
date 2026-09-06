import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Sale — M.A.S & SONS',
  description: 'Quotation, payment, shipping, and inspection terms for vehicles and equipment exported by M.A.S & SONS from Japan.',
};

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: 'Quotations',
    body: [
      'Listed prices are FOB (free on board) at the Japanese port shown on the unit. A C&F or CIF quotation adds ocean freight, and for CIF marine insurance, to your named port at the carrier rate current on the day of quoting.',
      'A quotation is valid for seven days. Freight rates and vessel schedules can change; we confirm the final figure on the pro-forma invoice.',
    ],
  },
  {
    title: 'Ordering and payment',
    body: [
      'An order is confirmed when we issue a pro-forma invoice and you accept it. Payment is by bank transfer to our Japanese corporate account only. We never ask for payment to a personal account or through a third party.',
      'A unit is reserved for you once the deposit stated on the pro-forma invoice is received. The balance is due before the bill of lading is released.',
    ],
  },
  {
    title: 'Condition and inspection',
    body: [
      'Every unit is sold with its auction inspection sheet, which records the grade, mileage or hours, and any noted damage or repair history. We share the original sheet on request before you commit.',
      'Units are used goods sold as described on the sheet and in our listing. Buyers may arrange an independent pre-shipment inspection at their cost; we cooperate with any recognised inspection company.',
    ],
  },
  {
    title: 'Shipping and documents',
    body: [
      'We handle Japanese de-registration, export inspection, and booking. You receive the export certificate, bill of lading, commercial invoice, and where your country requires it a pre-shipment inspection certificate.',
      'Transit times shown on this site are typical sailing times and are not guaranteed. Import duties, port charges, and clearance at destination are the buyer’s responsibility.',
    ],
  },
  {
    title: 'Cancellations',
    body: [
      'Before a unit is de-registered for export, a cancellation is refunded less bank charges and any costs already incurred. After de-registration or shipment booking, the deposit is not refundable because the unit can no longer be sold in Japan.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      `These terms are governed by the laws of Japan. ${SITE.legalName} is a licensed secondhand dealer, ${SITE.license}, registered at ${SITE.address}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-14">
      <PageHeader eyebrow="Legal" title="Terms of sale" description="The terms that apply to every quotation and order placed with M.A.S & SONS." />
      <div className="flex flex-col gap-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-ink">{s.title}</h2>
            <div className="mt-2 flex flex-col gap-3 text-[15px] leading-relaxed text-sub">
              {s.body.map((p) => <p key={p}>{p}</p>)}
            </div>
          </section>
        ))}
        <p className="border-t border-line pt-5 text-xs text-sub">Last updated September 2026.</p>
      </div>
    </main>
  );
}
