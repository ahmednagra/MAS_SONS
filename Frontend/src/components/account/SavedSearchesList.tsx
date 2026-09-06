'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useSavedSearches, useDeleteSavedSearch } from '@/hooks/queries';

const FILTER_LABEL: Record<string, string> = {
  category: 'Category', make: 'Make', model: 'Model', body_type: 'Body', year_min: 'From', year_max: 'To',
  price_min: 'Min $', price_max: 'Max $', steering_position: 'Steering', auction_grade_min: 'Grade ≥',
};

const noopSubscribe = () => () => {};

export function SavedSearchesList() {
  // The query's `enabled` depends on a browser-only cookie (useSessionKey), so it's always
  // false during SSR and true on the client — branching render on `isLoading` before mount
  // would make the server and first client pass disagree and fail hydration. This is the
  // documented useSyncExternalStore idiom for a hydration-safe "are we on the client yet"
  // check: server snapshot is always false, client snapshot is always true, no setState-in-
  // effect needed.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const { data: searches, isLoading } = useSavedSearches();
  const del = useDeleteSavedSearch();

  if (!mounted || isLoading) return <div className="mt-6 h-24 animate-pulse rounded-sm bg-surface" />;

  if (!searches?.length) {
    return (
      <p className="mt-4 text-sm text-sub">
        No saved searches yet — filter{' '}
        <Link href="/stock" className="font-medium text-ink underline underline-offset-2">stock</Link>{' '}
        the way you like and use &quot;Save this search&quot; to come back to it later.
      </p>
    );
  }

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {searches.map((search) => {
        const params = new URLSearchParams(search.filters).toString();
        const summary = Object.entries(search.filters).map(([k, v]) => `${FILTER_LABEL[k] ?? k}: ${v}`).join(' · ');
        return (
          <li key={search.id} className="flex items-center justify-between gap-4 rounded-sm border border-line bg-surface p-4">
            <div className="min-w-0">
              <Link href={`/stock${params ? `?${params}` : ''}`} className="font-medium text-ink hover:underline">
                {search.name || 'Untitled search'}
              </Link>
              <p className="mt-0.5 truncate font-mono text-[11px] text-sub">{summary || 'No filters'}</p>
            </div>
            <button
              type="button"
              disabled={del.isPending}
              onClick={() => del.mutate(search.id)}
              className="shrink-0 text-xs font-medium text-sub hover:text-ink disabled:opacity-50"
            >
              Delete
            </button>
          </li>
        );
      })}
    </ul>
  );
}
