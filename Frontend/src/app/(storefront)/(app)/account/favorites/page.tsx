import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { getAccessToken } from '@/lib/session';
import { getFavoritesServer } from '@/services/favorites/favorites.server';
import { getUnitsByIdsServer } from '@/services/stock/stock.server';
import { ResultsGrid } from '@/components/stock/ResultsGrid';

export const metadata: Metadata = { title: 'Your favorites — M.A.S & SONS' };

// Reads the session cookie, so it stays out of the page's top level and behind
// Suspense (docs/authentication-with-cache-components.md), matching account/page.tsx.
async function FavoritesContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account/favorites');

  const token = await getAccessToken();
  const favorites = await getFavoritesServer(token!);
  const units = await getUnitsByIdsServer(favorites.map((f) => f.unit_id));

  if (!units.length) {
    return (
      <p className="mt-4 text-sm text-sub">
        You haven&apos;t saved any favorites yet — browse{' '}
        <Link href="/stock" className="font-medium text-ink underline underline-offset-2">
          stock
        </Link>{' '}
        and tap the heart on a unit to save it here.
      </p>
    );
  }

  return (
    <>
      <p className="mt-1 text-sm text-sub">
        {units.length} saved unit{units.length === 1 ? '' : 's'}
      </p>
      <div className="mt-6">
        <ResultsGrid units={units} />
      </div>
    </>
  );
}

function FavoritesSkeleton() {
  return <div className="mt-6 h-40 animate-pulse rounded-sm bg-surface" />;
}

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Favorites</h1>
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesContent />
      </Suspense>
    </div>
  );
}
