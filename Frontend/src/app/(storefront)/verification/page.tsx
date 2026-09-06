import Link from 'next/link';
import { cacheLife, cacheTag } from 'next/cache';
import { SampleSheet } from '@/components/verification/SampleSheet';
import { SITE } from '@/config/site';
import { getStockFacetsServer, searchStockServer } from '@/services/stock/stock.server';

export const metadata = {
  title: 'Verification & Trust — M.A.S & SONS',
  description: 'How Japanese auction grades and sheet symbols work, our secondhand dealer licence and how to verify it, chassis checks, and how to pay safely.',
};

const GRADES = [
  { k: '5', v: 'Effectively as new — negligible wear, no repair history.' },
  { k: '4.5', v: 'Excellent condition with only minor cosmetic marks.' },
  { k: '4', v: 'Good condition, normal use marks, mechanically sound.' },
  { k: '3.5', v: 'Visible wear or small panel damage noted on the sheet.' },
  { k: '3', v: 'Older or higher-use unit, condition notes worth reading closely.' },
  { k: 'R', v: 'Repaired — accident history disclosed on the sheet.' },
  { k: 'RA', v: 'Repaired, light — minor recorded repair work.' },
];

const SYMBOLS = [
  { s: 'A', v: 'Scratch' },
  { s: 'U', v: 'Dent' },
  { s: 'B', v: 'Dent with scratch' },
  { s: 'W', v: 'Wave / repaired panel' },
  { s: 'S', v: 'Rust' },
  { s: 'C', v: 'Corrosion' },
  { s: 'Y', v: 'Crack (bumper, lamp, glass)' },
  { s: 'X', v: 'Panel replaced' },
  { s: 'XX', v: 'Panel needs replacing' },
];

const SEVERITY = [
  { n: '1', v: 'Small — hard to see unless you look for it (a scratch under a thumbnail long).' },
  { n: '2', v: 'Medium — visible up close (a scratch of a few centimetres, a coin-sized dent).' },
  { n: '3', v: 'Large — visible from a distance (a scratch longer than a hand, a dent across the panel).' },
];

const TRUST = [
  'Real auction sheet published with every listing — grade, inspector notes, diagram.',
  'Repair/accident history (修復歴) disclosed, not implied.',
  'Odometer photographed at the time of listing.',
  'Licensed secondhand dealer — verify our registration any time.',
  'Chassis number cross-checked against the original Japanese registration, on request.',
];

const PAYMENT_CHECKLIST = [
  'We will never ask you to send payment to a personal account, or to anyone other than our registered company account.',
  'Wire instructions are confirmed in writing before you send anything — call or WhatsApp us to verify if a number or account ever looks different from a previous conversation.',
  'We do not request payment via gift cards, cryptocurrency, or any untraceable method.',
  'A quote is not an invoice. Payment is only requested against a formal invoice tied to a specific unit.',
];

async function getTrustData() {
  'use cache';
  cacheLife('hours');
  cacheTag('stock');
  try {
    const [facets, best] = await Promise.all([
      getStockFacetsServer(),
      searchStockServer({ auction_grade_min: '4.5', sort: 'grade_desc', limit: 1 }),
    ]);
    return { grades: facets.grades, example: best.items[0] ?? null };
  } catch {
    return { grades: [], example: null };
  }
}

export default async function VerificationPage() {
  const { grades, example } = await getTrustData();
  const count = (k: string) => grades.find((g) => g.value === k)?.count ?? 0;
  const contact = SITE.email ? `mailto:${SITE.email}?subject=${encodeURIComponent('Licence verification request')}` : '/request';

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col gap-9 px-4 py-6 sm:py-7">
      {/* Compact two-column header, matching the stock and landing pages: no empty right half. */}
      <header className="grid gap-3 border-b border-line pb-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-10">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">Auction grades</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-[2.25rem]">
            You are wiring money against a grade. So we publish the sheet.
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-sub">
          Every unit carries the auction inspector&rsquo;s own sheet — grade, condition notes and diagram — not our summary of it. This page shows how to read one, how to check who we are, and how to pay without risk.
        </p>
      </header>

      <section aria-labelledby="sheet-heading" className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div>
          <h2 id="sheet-heading" className="mb-4 text-lg font-semibold text-ink">What a sheet looks like</h2>
          <SampleSheet />
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">The grade scale</h2>
          <ul className="flex flex-col">
            {GRADES.map((g) => {
              const n = count(g.k);
              return (
                <li key={g.k} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-3 border-t border-line py-2.5">
                  <span className="text-sm font-semibold tabular-nums text-accent">{g.k}</span>
                  <span className="text-sm text-sub">{g.v}</span>
                  {n > 0 ? (
                    <Link href={`/stock?auction_grade_min=${g.k}`} className="whitespace-nowrap font-mono text-[11px] text-ink underline-offset-4 hover:underline">
                      {n} in stock →
                    </Link>
                  ) : (
                    <span className="whitespace-nowrap font-mono text-[11px] text-sub">none now</span>
                  )}
                </li>
              );
            })}
          </ul>
          {example && (
            <p className="mt-4 text-sm text-sub">
              See it on a live listing:{' '}
              <Link href={`/stock/${example.slug}`} className="font-medium text-ink underline-offset-4 hover:underline">
                {example.year} {example.make} {example.model}, grade {example.auction_grade} →
              </Link>
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="symbols-heading" className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="symbols-heading" className="mb-4 text-lg font-semibold text-ink">Reading the diagram</h2>
          <p className="mb-3 text-sm leading-relaxed text-sub">
            Each imperfection is marked on the diagram as a letter code plus a severity number, for example <span className="font-mono text-ink">A2</span> or <span className="font-mono text-ink">U1</span>.
          </p>
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {SYMBOLS.map((sym) => (
              <li key={sym.s} className="grid grid-cols-[3rem_1fr] gap-3 border-t border-line py-2">
                <span className="font-mono text-sm font-semibold text-accent">{sym.s}</span>
                <span className="text-sm text-sub">{sym.v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">The severity number</h2>
          <ul className="flex flex-col">
            {SEVERITY.map((s) => (
              <li key={s.n} className="grid grid-cols-[3rem_1fr] gap-3 border-t border-line py-2">
                <span className="font-mono text-sm font-semibold text-accent">{s.n}</span>
                <span className="text-sm text-sub">{s.v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-sm border border-line bg-surface p-4 text-sm leading-relaxed text-sub">
            <span className="font-semibold text-ink">A worked example.</span> <span className="font-mono text-ink">U2</span> on the rear door means a dent a few centimetres across, visible when you stand next to the car. A sheet with only 1s and 2s on the outer panels is normal for a grade 4; a 3 anywhere, or any mark on the frame section, is what pushes a unit to 3.5 or to R.
          </p>
        </div>
      </section>


      <section aria-labelledby="licence-heading" className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-sm border border-line bg-surface p-5">
          <h2 id="licence-heading" className="mb-3 text-lg font-semibold text-ink">Secondhand dealer licence</h2>
          <dl className="grid gap-2 text-sm">
            <Row k="Licence number" v={<span className="font-mono">{SITE.license.replace(/^古物商許可\s*/, '')}</span>} />
            <Row k="Licence type" v="古物商許可 · secondhand goods dealer" />
            <Row k="Issued by" v="茨城県公安委員会 · Ibaraki Prefectural Public Safety Commission" />
            <Row k="Licensee" v={SITE.legalName} />
            <Row k="Registered office" v={SITE.address} last />
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-sub">
            <span className="font-semibold text-ink">How to verify it.</span> Quote the number to the Ibaraki Prefectural Police, who keep the dealer register, or{' '}
            <a href={contact} className="font-medium text-ink underline-offset-4 hover:underline">ask us for a scan of the licence</a>{' '}
            and check that the name and number match this page and your invoice.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">Chassis number check</h2>
          <p className="text-sm leading-relaxed text-sub">
            Before you pay, we can match the chassis number on the listing against the unit itself and its Japanese registration record. You receive a photo of the chassis plate, a photo of the odometer taken the same day, and the registration extract, so the car on the invoice is provably the car on the sheet.
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-sub">
            {['Free on any unit you are quoting on', 'Sent within one business day (JST)', 'Photos are dated and show the unit in our yard'].map((t) => (
              <li key={t} className="flex gap-2.5"><Tick />{t}</li>
            ))}
          </ul>
          <Link href="/request" className="mt-4 inline-flex rounded-sm border border-ink px-4 py-2 text-sm font-semibold text-ink hover:bg-surface">
            Request a chassis check →
          </Link>
        </div>
      </section>

      <section aria-labelledby="pay-heading" className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 id="verify-heading" className="mb-3 text-lg font-semibold text-ink">What we verify on every listing</h2>
          <ul className="flex flex-col gap-2.5">
            {TRUST.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-sub"><Tick />{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 id="pay-heading" className="mb-3 text-lg font-semibold text-ink">Paying safely</h2>
          <ul className="flex flex-col gap-2.5">
            {PAYMENT_CHECKLIST.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-sub"><Tick />{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="close-heading" className="flex flex-wrap items-center justify-between gap-4 rounded-sm bg-ink p-6 text-paper">
        <div>
          <h2 id="close-heading" className="text-xl font-semibold tracking-tight">Ask us for the sheet on any unit</h2>
          <p className="mt-1 text-sm text-paper/80">Original scan, translated summary, and the odometer photo, before you commit to anything.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/stock" className="rounded-sm bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">Browse stock</Link>
          <Link href="/request" className="rounded-sm border border-paper/40 px-5 py-2.5 text-sm font-semibold text-paper hover:bg-paper/10">Get a quote</Link>
        </div>
      </section>
    </main>
  );
}

function Row({ k, v, last = false }: { k: string; v: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${last ? '' : 'border-b border-line pb-2'}`}>
      <dt className="text-sub">{k}</dt>
      <dd className="text-right font-medium text-ink">{v}</dd>
    </div>
  );
}

function Tick() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden className="mt-1 flex-none"><path d="M5 13l4 4L19 7" /></svg>
  );
}
