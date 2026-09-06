import Link from 'next/link';
import { Button } from '@/components/ui';

/** Borderless on the paper background; the button is the only accent on this screen. */
export function SourcingTeaser() {
  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-accent">Not in current stock?</p>
        <h2 className="font-display text-[2rem] leading-[1.05] text-ink sm:text-[2.25rem]">We search live Japan auctions on request</h2>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-sub">
          Tell us the make, grade and budget — we bid at auction on your behalf and send the real sheet before you commit to anything.
        </p>
      </div>
      <Link href="/request"><Button className="whitespace-nowrap px-6 py-3">Request sourcing →</Button></Link>
    </div>
  );
}
