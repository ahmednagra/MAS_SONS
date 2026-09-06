import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { PageHeader } from '@/components/layout/PageHeader';
import { PortTable } from '@/components/shipping/PortTable';
import { RouteHero } from '@/components/shipping/RouteHero';
import { listDestinationsServer } from '@/services/destinations';
import { SITE } from '@/config/site';

export const metadata = {
  title: 'Shipping — M.A.S & SONS',
  description: 'Ports, sailing times, RoRo vs. container, FOB / C&F / CIF compared, and the documents that ship with every unit exported from Japan.',
};

async function getDestinations() {
  'use cache';
  cacheLife('days');
  cacheTag('destinations');
  try {
    return await listDestinationsServer();
  } catch {
    return [];
  }
}

// What each Incoterm includes; "you" = the buyer arranges it.
const INCOTERM_ROWS: Array<{ item: string; fob: string; cfr: string; cif: string }> = [
  { item: 'Vehicle price and export preparation in Japan', fob: 'Included', cfr: 'Included', cif: 'Included' },
  { item: 'Inland transport to the Japanese port', fob: 'Included', cfr: 'Included', cif: 'Included' },
  { item: 'Export inspection and export certificate', fob: 'Included', cfr: 'Included', cif: 'Included' },
  { item: 'Ocean freight to your port', fob: 'You arrange', cfr: 'Included', cif: 'Included' },
  { item: 'Marine insurance in transit', fob: 'You arrange', cfr: 'You arrange', cif: 'Included' },
  { item: 'Import duty and customs clearance at destination', fob: 'You', cfr: 'You', cif: 'You' },
];

const SHIPS_WITH = [
  { name: 'Export certificate', note: 'Proves the unit was formally de-registered in Japan for export (輸出抹消仮登録証明書).' },
  { name: 'Bill of lading (B/L)', note: 'The carrier’s document of title; your agent presents it to release the unit at your port.' },
  { name: 'Commercial invoice', note: 'States the agreed price and Incoterm; customs uses it for valuation.' },
  { name: 'Pre-shipment inspection certificate', note: 'Issued by an inspection company in Japan where your country requires one before import.' },
];

const YOU_PROVIDE = [
  { name: 'Consignee details', note: 'Full name or company name, address, phone and email exactly as they should appear on the bill of lading.' },
  { name: 'Identification', note: 'Passport or national ID for a private buyer; company registration for a business.' },
  { name: 'Clearing agent', note: 'The agent at your port who will clear the unit; we send the documents to them directly.' },
  { name: 'Country-specific paperwork', note: 'For example an import permit, a tax identification number, or an age-of-vehicle declaration where your country limits it.' },
];

// Countries whose regulator requires a pre-shipment inspection before the unit sails.
const PSI_COUNTRIES = ['KE', 'TZ', 'UG', 'ZM', 'MZ', 'BD', 'LK'];

export default async function ShippingPage() {
  const destinations = await getDestinations();
  const psiPorts = destinations.filter((d) => PSI_COUNTRIES.includes(d.country_code));

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-10">
      <PageHeader
        eyebrow="Logistics"
        title="From a Japanese port to yours"
        description="Every quotation is priced FOB, C&F or CIF. Pick the term that matches how much of the journey you want us to arrange; the sections below show what each covers, how long it takes, and what paperwork moves with the unit."
      />

      <RouteHero destinations={destinations} />

      <section aria-labelledby="ports-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="ports-heading" className="text-2xl font-semibold tracking-tight text-ink">Ports we ship to</h2>
          <p className="text-sm text-sub">Sailing days are typical bands from {SITE.originPorts.join(' and ')}, not a booking.</p>
        </div>
        <PortTable destinations={destinations} />
      </section>

      <section aria-labelledby="incoterms-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="incoterms-heading" className="text-2xl font-semibold tracking-tight text-ink">FOB, C&amp;F or CIF: what each covers</h2>
          <p className="text-sm text-sub">Most buyers choose C&amp;F and insure locally; CIF if you want one invoice for everything.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
                <th scope="col" className="py-2.5 pr-4 font-semibold">Cost item</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">FOB</th>
                <th scope="col" className="py-2.5 pr-4 font-semibold">C&amp;F <span className="ml-1 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] text-accent-ink">most chosen</span></th>
                <th scope="col" className="py-2.5 font-semibold">CIF</th>
              </tr>
            </thead>
            <tbody>
              {INCOTERM_ROWS.map((r) => (
                <tr key={r.item} className="border-b border-line">
                  <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">{r.item}</th>
                  {[r.fob, r.cfr, r.cif].map((v, i) => (
                    <td key={i} className={`py-3 pr-4 ${v === 'Included' ? 'text-ink' : 'text-sub'}`}>
                      {v === 'Included' ? <span className="inline-flex items-center gap-1.5"><Tick /> Included</span> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="cost-heading" className="grid gap-6 rounded-sm bg-ink p-6 text-paper lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 id="cost-heading" className="text-2xl font-semibold tracking-tight">How much is freight?</h2>
          <p className="mt-3 text-sm leading-relaxed text-paper/80">
            It depends on the port, the unit&rsquo;s size, and the carrier&rsquo;s rate on the day, so we do not publish a flat figure. What you get instead is an itemised quotation within one business day, valid for seven days, showing every line separately so nothing is hidden in the total.
          </p>
          <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
            {['Vehicle price (FOB)', 'Ocean freight to your port', 'Marine insurance (CIF only)', 'Pre-shipment inspection, if required', 'Document courier', 'Nothing else'].map((line) => (
              <div key={line} className="flex items-center gap-2"><span className="h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden />{line}</div>
            ))}
          </dl>
        </div>
        <div className="flex flex-col justify-between gap-4 rounded-sm border border-paper/15 p-5">
          <p className="text-sm leading-relaxed text-paper/80">Pick a unit, choose your port, and the quotation arrives by email with the sailing schedule. No account needed.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/stock" className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">Browse stock</Link>
            <Link href="/request" className="rounded-sm border border-paper/40 px-5 py-2.5 text-sm font-semibold text-paper hover:bg-paper/10">Ask for a quote</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="method-heading">
        <h2 id="method-heading" className="mb-4 text-2xl font-semibold tracking-tight text-ink">RoRo or container?</h2>
        <dl className="grid gap-6 sm:grid-cols-2">
          <div className="border-t-2 border-accent pt-3">
            <dt className="text-sm font-semibold text-ink">RoRo (roll-on / roll-off)</dt>
            <dd className="mt-1 text-sm leading-relaxed text-sub">
              The standard for a single running vehicle: it is driven onto the vessel and lashed on deck. Faster to book and usually the lower cost for one unit. Nothing may be shipped inside the vehicle.
            </dd>
          </div>
          <div className="border-t-2 border-accent pt-3">
            <dt className="text-sm font-semibold text-ink">Container</dt>
            <dd className="mt-1 text-sm leading-relaxed text-sub">
              For <Link href="/equipment" className="font-medium text-ink underline-offset-4 hover:underline">heavy equipment</Link>, non-runners, several units in one shipment, or ports without a regular RoRo service. More protection in transit; spare parts can travel in the same box.
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="documents-heading" className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 id="documents-heading" className="mb-4 text-2xl font-semibold tracking-tight text-ink">What ships with your unit</h2>
          <dl className="flex flex-col gap-4">
            {SHIPS_WITH.map((doc) => (
              <div key={doc.name} className="border-t border-line pt-3">
                <dt className="text-sm font-semibold text-ink">{doc.name}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-sub">{doc.note}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">What we need from you</h2>
          <dl className="flex flex-col gap-4">
            {YOU_PROVIDE.map((doc) => (
              <div key={doc.name} className="border-t border-line pt-3">
                <dt className="text-sm font-semibold text-ink">{doc.name}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-sub">{doc.note}</dd>
              </div>
            ))}
          </dl>
          {psiPorts.length > 0 && (
            <p className="mt-5 rounded-sm border border-line bg-surface p-4 text-sm leading-relaxed text-sub">
              <span className="font-semibold text-ink">Pre-shipment inspection.</span> Shipments to{' '}
              {psiPorts.map((d, i) => (
                <span key={d.country_code}>
                  <Link href={`/destinations/${d.country_code}`} className="font-medium text-ink underline-offset-4 hover:underline">{d.country_name}</Link>
                  {i < psiPorts.length - 2 ? ', ' : i === psiPorts.length - 2 ? ' and ' : ''}
                </span>
              ))}{' '}
              must be inspected in Japan before sailing. We book the inspection and the certificate travels with the documents; the fee appears as its own line on your quotation.
            </p>
          )}
        </div>
      </section>

      <p className="border-t border-line pt-5 text-sm text-sub">
        Customs clearance and import duty at destination are the buyer&rsquo;s responsibility. Each{' '}
        <Link href={`/destinations/${destinations[0]?.country_code ?? 'KE'}`} className="font-medium text-ink underline-offset-4 hover:underline">destination page</Link>{' '}
        summarises the local rules we know of; your clearing agent has the final word. See also the{' '}
        <Link href="/terms" className="font-medium text-ink underline-offset-4 hover:underline">terms of sale</Link>.
      </p>
    </main>
  );
}

function Tick() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
  );
}
