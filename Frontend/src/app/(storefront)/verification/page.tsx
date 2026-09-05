import { PageHeader } from '@/components/layout/PageHeader';

export const metadata = {
  title: 'Verification & Trust — M.A.S & SONS',
  description: 'Auction grades, the inspection-sheet symbol guide, our secondhand dealer license, and how to pay safely.',
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
  { s: 'W', v: 'Wave / uneven panel' },
  { s: 'S', v: 'Rust' },
  { s: 'X', v: 'Panel replaced' },
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

export default function VerificationPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-16">
      <PageHeader
        eyebrow="Auction grades"
        title="You are wiring money against a grade. So we publish the sheet."
        description="Every unit carries the auction inspector's own sheet — grade, condition notes and diagram — not our summary of it."
      />

      <section className="mb-14 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">The grade scale</h2>
          <ul className="grid gap-1 divide-y divide-line border border-line">
            {GRADES.map((g) => (
              <li key={g.k} className="grid grid-cols-[3.5rem_1fr] gap-3 bg-surface p-3">
                <span className="text-sm font-semibold tabular-nums text-accent">{g.k}</span>
                <span className="text-sm text-sub">{g.v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">Reading the diagram</h2>
          <p className="mb-4 text-sm leading-relaxed text-sub">
            The sheet marks any imperfection on a diagram of the unit using a standard set of symbols:
          </p>
          <ul className="grid gap-1 divide-y divide-line border border-line">
            {SYMBOLS.map((sym) => (
              <li key={sym.s} className="grid grid-cols-[3.5rem_1fr] gap-3 bg-surface p-3">
                <span className="text-sm font-semibold text-accent">{sym.s}</span>
                <span className="text-sm text-sub">{sym.v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-lg font-semibold text-ink">What we verify on every listing</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TRUST.map((line) => (
            <li key={line} className="flex gap-2.5 text-sm text-sub">
              <span aria-hidden className="mt-0.5 text-accent">✓</span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border border-line bg-paper p-5">
          <h2 className="mb-3 text-lg font-semibold text-ink">Secondhand dealer license</h2>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-line pb-2">
              <dt className="text-sub">License number</dt><dd className="font-medium text-ink">第401210001551</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-sub">Registered office</dt><dd className="font-medium text-ink">Shimotsuma, Ibaraki, Japan</dd>
            </div>
          </dl>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold text-ink">Paying safely</h2>
          <ul className="flex flex-col gap-2.5">
            {PAYMENT_CHECKLIST.map((line) => (
              <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-sub">
                <span aria-hidden className="mt-0.5 text-accent">✓</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
