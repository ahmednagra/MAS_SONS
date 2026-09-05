'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getFavoriteListings, addFavorite, removeFavorite } from '@/services/favorites';
import type { FavoriteToggleInput } from '@/types/favorites';

export const useFavoriteListings = (userId: string) =>
  useQuery({
    queryKey: queryKeys.favorites.list(userId),
    queryFn: () => getFavoriteListings(userId),
    enabled: !!userId,
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export function useToggleFavorite(userId: string) {
  const qc = useQueryClient();
  const key = queryKeys.favorites.list(userId);

  return useMutation({
    mutationFn: ({ unitId, isFavorited }: FavoriteToggleInput) => (isFavorited ? removeFavorite(unitId) : addFavorite(unitId)),
    onMutate: async ({ unitId, isFavorited }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<string[]>(key);
      qc.setQueryData<string[]>(key, (old = []) => (isFavorited ? old.filter((id) => id !== unitId) : [...old, unitId]));
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx && qc.setQueryData(key, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}
