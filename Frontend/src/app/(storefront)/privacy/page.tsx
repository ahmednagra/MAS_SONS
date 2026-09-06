import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy — M.A.S & SONS',
  description: 'What M.A.S & SONS collects when you request a quote or sell a vehicle, why, and how to have it removed.',
};

const SECTIONS: Array<{ title: string; body: string[] }> = [
  {
    title: 'What we collect',
    body: [
      'When you request a quote, sourcing, or a buyback valuation we store the details you type into the form: your name, email address, WhatsApp or phone number, destination country, and any message or photos you attach.',
      'When you create an account we also store your login identity (email and password hash, or your Google account identifier). We never store card numbers; payment is by bank transfer.',
      'Our servers keep standard access logs (IP address, browser, pages visited, timestamps) for security and troubleshooting.',
    ],
  },
  {
    title: 'Why we use it',
    body: [
      'To prepare and send the quotation or valuation you asked for, to arrange shipping and export documents once you order, and to answer your questions.',
      'To notify you about the status of your request or order by email, and by WhatsApp only if you gave us a number.',
      'We do not sell or rent personal data, and we do not use it for advertising.',
    ],
  },
  {
    title: 'Who sees it',
    body: [
      'Our own staff in Japan, and the shipping line, freight forwarder, and inspection company needed to deliver your unit. They receive only what the shipment requires.',
      'Service providers that host our systems and send our email. They act on our instructions only.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'Quote and sourcing requests are kept for two years after the last contact. Order and invoice records are kept for the period required by Japanese commercial and tax law.',
      'Account data is kept until you delete your account.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      `Email us at ${SITE.email ?? 'the address in the footer'} to see, correct, or delete the personal data we hold about you, or to stop notifications. We answer within ten business days.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-4 py-14">
      <PageHeader eyebrow="Legal" title="Privacy policy" description={`How ${SITE.legalName} handles the personal data you give us. Registered dealer ${SITE.license}, ${SITE.address}.`} />
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
