import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { NotificationBell } from '@/components/account/NotificationBell';
import { logout } from './actions';

const NAV = [
  { label: 'Overview', href: '/account' },
  { label: 'Favorites', href: '/account/favorites' },
  { label: 'Saved searches', href: '/account/saved-searches' },
  { label: 'Orders', href: '/account/orders' },
  { label: 'Notifications', href: '/account/notifications' },
];

// Reads the session cookie, so it must sit behind Suspense and stream in rather
// than block {children} along with it (docs/authentication-with-cache-components.md
// — "keep the session read out of a layout's top level").
async function AccountSidebar() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{user.full_name}</p>
          <p className="text-xs text-sub">{user.email}</p>
        </div>
        <NotificationBell />
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-sm px-2 py-1.5 text-sm font-medium text-ink hover:bg-surface">
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={logout}>
        <button type="submit" className="rounded-sm px-2 py-1.5 text-left text-sm font-medium text-sub hover:bg-surface hover:text-ink">
          Sign out
        </button>
      </form>
    </>
  );
}

function AccountSidebarSkeleton() {
  return (
    <>
      <div className="h-9 w-32 animate-pulse rounded-sm bg-surface" />
      <div className="h-7 w-24 animate-pulse rounded-sm bg-surface" />
    </>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 sm:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 sm:w-56">
        <Suspense fallback={<AccountSidebarSkeleton />}>
          <AccountSidebar />
        </Suspense>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
