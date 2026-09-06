import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/get-current-user';

export const metadata: Metadata = { title: 'Your account — M.A.S & SONS' };

async function WelcomeHeading() {
  const user = await getCurrentUser();
  return <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back{user ? `, ${user.full_name}` : ''}</h1>;
}

export default function AccountPage() {
  return (
    <div>
      <Suspense fallback={<h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>}>
        <WelcomeHeading />
      </Suspense>
      <p className="mt-2 text-sm text-sub">Your favorites, saved searches, and orders will show up here.</p>
    </div>
  );
}
