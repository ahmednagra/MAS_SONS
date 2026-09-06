'use client';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { useSessionKey } from './useSessionKey';
import { getFavorites, addFavorite, removeFavorite } from '@/services/favorites';
import type { Favorite } from '@/types/favorites';

const favoritesOptions = (sessionKey: string) =>
  queryOptions({
    queryKey: queryKeys.favorites.list(sessionKey),
    queryFn: getFavorites,
    enabled: sessionKey !== 'guest',
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export function useFavorites() {
  return useQuery(favoritesOptions(useSessionKey()));
}

export function useIsFavorited(unitId: number) {
  return useQuery({
    ...favoritesOptions(useSessionKey()),
    select: (favorites) => favorites.some((f) => f.unit_id === unitId),
  });
}

interface ToggleFavoriteVars {
  unitId: number;
  isFavorited: boolean;
}

interface ToggleFavoriteContext {
  previous: Favorite[] | undefined;
}

export function useToggleFavorite() {
  const sessionKey = useSessionKey();
  const qc = useQueryClient();
  const key = queryKeys.favorites.list(sessionKey);

  return useMutation<Favorite | { message: string }, Error, ToggleFavoriteVars, ToggleFavoriteContext>({
    mutationFn: ({ unitId, isFavorited }) => (isFavorited ? removeFavorite(unitId) : addFavorite(unitId)),
    onMutate: async ({ unitId, isFavorited }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Favorite[]>(key);
      qc.setQueryData<Favorite[]>(key, (old = []) =>
        isFavorited
          ? old.filter((f) => f.unit_id !== unitId)
          : [...old, { id: -unitId, unit_id: unitId, created_at: new Date().toISOString() }],
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(key, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
