import Link from 'next/link';
import { Button } from '@/components/ui';

export function SourcingTeaser() {
  return (
    <div className="grid gap-6 border border-line bg-paper p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Not in current stock?</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">We search live Japan auctions on request</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
          Tell us the make, grade and budget — we bid at auction on your behalf and send the real sheet before you commit to anything.
        </p>
      </div>
      <Link href="/stock"><Button className="whitespace-nowrap">Browse stock →</Button></Link>
    </div>
  );
}
