import Link from 'next/link';
import { Button } from '@/components/ui';

const NAV = [
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Equipment', href: '/equipment' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Verification', href: '/verification' },
  { label: 'How It Works', href: '/how-it-works' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex min-h-[66px] max-w-[1200px] flex-wrap items-center gap-6 px-4">
        <Link href="/" className="flex items-baseline gap-2 text-ink">
          <span className="text-lg font-bold tracking-tight">M.A.S &amp; SONS</span>
          <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-sub">Japan</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-1 gap-6 overflow-x-auto">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3.5">
          <Link href="/stock" className="whitespace-nowrap text-[13.5px] font-medium text-sub">Track a quote</Link>
          <Link href="/stock"><Button>Get a Quote</Button></Link>
        </div>
      </div>
    </header>
  );
}
