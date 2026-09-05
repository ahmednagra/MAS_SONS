import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';

export const getFavoriteListings = async (userId: string) =>
  unwrap(await nextjsApiClient.get<string[]>(`/api/v0${ENDPOINTS.FAVORITES.LIST(userId)}`));

export const addFavorite = async (unitId: string) =>
  unwrap(await nextjsApiClient.post<{ unitId: string }>(`/api/v0${ENDPOINTS.FAVORITES.ADD}`, { unitId }));

export const removeFavorite = async (unitId: string) =>
  unwrap(await nextjsApiClient.delete<{ unitId: string }>(`/api/v0${ENDPOINTS.FAVORITES.REMOVE(unitId)}`));
