import { Suspense } from 'react';
import Link from 'next/link';
import { Brand } from '@/components/layout/Brand';
import { Button } from '@/components/ui';
import { SITE, telHref } from '@/config/site';
import { getCurrentUser } from '@/lib/get-current-user';

const NAV = [
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Equipment', href: '/equipment' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Verification', href: '/verification' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'FAQ', href: '/faq' },
];

// Isolated behind Suspense: reading the session cookie makes this one slot dynamic
// without pulling the rest of the (statically prerendered) header/page along with it.
async function AccountLink() {
  const user = await getCurrentUser();
  return user ? (
    <Link href="/account" className="whitespace-nowrap text-sm font-medium text-ink underline-offset-4 hover:underline">
      {user.full_name.split(' ')[0]}
    </Link>
  ) : (
    <Link href="/login" className="hidden whitespace-nowrap text-sm font-medium text-sub sm:inline">Sign in</Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex min-h-[68px] max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-2 px-4">
        <Brand />
        <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />
        <nav aria-label="Primary" className="no-scrollbar order-last flex w-full gap-5 overflow-x-auto pb-2 sm:order-none sm:w-auto sm:flex-1 sm:pb-0">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-sm font-medium text-ink underline-offset-4 hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 sm:ml-0">
          {SITE.phone && (
            <a href={telHref(SITE.phone)} className="hidden whitespace-nowrap text-sm font-semibold text-ink lg:inline">
              {SITE.phone}
            </a>
          )}
          <Link href="/stock" className="hidden whitespace-nowrap text-sm font-medium text-sub sm:inline">Browse stock</Link>
          <Suspense fallback={<span className="hidden whitespace-nowrap text-sm font-medium text-sub sm:inline">Sign in</span>}>
            <AccountLink />
          </Suspense>
          <Link href="/request"><Button>Get a quote</Button></Link>
        </div>
      </div>
    </header>
  );
}
