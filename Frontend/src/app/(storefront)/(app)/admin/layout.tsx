import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';

// Reads the session cookie, so it stays out of the layout's top level and behind
// Suspense rather than blocking {children} along with it
// (docs/authentication-with-cache-components.md). UI-level gate only — every admin
// route the backend exposes is independently enforced by `require_staff` there.
async function StaffGate({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.user_type !== 'staff') redirect('/login');
  return <>{children}</>;
}

function AdminSkeleton() {
  return <div className="h-64 animate-pulse rounded-sm bg-surface" />;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10">
      <Suspense fallback={<AdminSkeleton />}>
        <StaffGate>{children}</StaffGate>
      </Suspense>
    </div>
  );
}
