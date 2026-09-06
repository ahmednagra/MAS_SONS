'use client';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { useSessionKey } from './useSessionKey';
import { getSavedSearches, createSavedSearch, deleteSavedSearch } from '@/services/saved-searches';
import type { SavedSearch, SavedSearchCreate } from '@/types/saved-searches';

const savedSearchesOptions = (sessionKey: string) =>
  queryOptions({
    queryKey: queryKeys.savedSearches.list(sessionKey),
    queryFn: getSavedSearches,
    enabled: sessionKey !== 'guest',
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export function useSavedSearches() {
  return useQuery(savedSearchesOptions(useSessionKey()));
}

// Not optimistic — infrequent, settings-like actions where a brief round trip is fine and a
// real confirmation matters more than instant feedback (unlike the favorite-toggle).
export function useCreateSavedSearch() {
  const sessionKey = useSessionKey();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SavedSearchCreate) => createSavedSearch(data),
    onSuccess: (created: SavedSearch) => {
      qc.setQueryData<SavedSearch[]>(queryKeys.savedSearches.list(sessionKey), (old = []) => [created, ...old]);
    },
  });
}

export function useDeleteSavedSearch() {
  const sessionKey = useSessionKey();
  const qc = useQueryClient();
  const key = queryKeys.savedSearches.list(sessionKey);
  return useMutation({
    mutationFn: (id: number) => deleteSavedSearch(id),
    onSuccess: (_result, id) => {
      qc.setQueryData<SavedSearch[]>(key, (old = []) => old.filter((s) => s.id !== id));
    },
  });
}
