import Link from 'next/link';
import { AccordionItem } from '@/components/ui';
import { HOME_FAQ } from '@/content/faq';

export function HomeFaq() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">FAQ</p>
          <h2 className="font-display text-[2rem] leading-[1.05] text-ink sm:text-[2.25rem]">Before you ask</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-sub">
            The six questions every first-time importer sends us. The full list covers grades, documents and shipping terms.
          </p>
          <Link href="/faq" className="mt-5 inline-block text-sm font-medium text-ink underline-offset-4 hover:underline">All questions →</Link>
        </div>
        <div className="border-t border-line">
          {HOME_FAQ.map((item) => (
            <AccordionItem key={item.q} question={item.q}>{item.a}</AccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
