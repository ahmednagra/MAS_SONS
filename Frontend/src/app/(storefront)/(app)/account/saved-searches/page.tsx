import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { SavedSearchesList } from '@/components/account/SavedSearchesList';

export const metadata: Metadata = { title: 'Saved searches — M.A.S & SONS' };

// Reads the session cookie, so it stays out of the page's top level and behind
// Suspense (docs/authentication-with-cache-components.md), matching account/page.tsx.
async function Gate() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account/saved-searches');
  return <SavedSearchesList />;
}

export default function SavedSearchesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Saved searches</h1>
      <Suspense fallback={<div className="mt-6 h-24 animate-pulse rounded-sm bg-surface" />}>
        <Gate />
      </Suspense>
    </div>
  );
}
