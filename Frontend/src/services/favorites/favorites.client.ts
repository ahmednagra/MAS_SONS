import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Favorite } from '@/types/favorites';

export const getFavorites = async () => unwrap(await nextjsApiClient.get<Favorite[]>(`/api/v0${ENDPOINTS.FAVORITES.LIST}`));

export const addFavorite = async (unitId: number) =>
  unwrap(await nextjsApiClient.post<Favorite>(`/api/v0${ENDPOINTS.FAVORITES.ADD}`, { unit_id: unitId }));

export const removeFavorite = async (unitId: number) =>
  unwrap(await nextjsApiClient.delete<{ message: string }>(`/api/v0${ENDPOINTS.FAVORITES.REMOVE(String(unitId))}`));
