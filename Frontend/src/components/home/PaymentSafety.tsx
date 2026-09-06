import Link from 'next/link';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { PAYMENT_SAFETY_POINTS } from '@/content/home';

/** One calm section about the buyer's real fear: wire fraud. No box — the paper is the surface. */
export function PaymentSafety() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20">
      <SectionHeader
        eyebrow="Payment safety"
        title="How to pay us without risk"
        aside={<Link href="/verification" className="underline-offset-4 hover:underline">Full checklist →</Link>}
      />
      <ol className="grid gap-8 sm:grid-cols-3">
        {PAYMENT_SAFETY_POINTS.map((point, i) => (
          <li key={point} className="border-t border-ink pt-4">
            <span className="block font-mono text-xs tabular-nums text-sub">0{i + 1}</span>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">{point}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
