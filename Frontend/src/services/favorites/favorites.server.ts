import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Favorite, FavoriteCreate } from '@/types/favorites';

export const getFavoritesServer = async (authToken: string) =>
  unwrap(await serverApiClient.get<Favorite[]>(ENDPOINTS.FAVORITES.LIST, authToken));

export const addFavoriteServer = async (data: FavoriteCreate, authToken: string) =>
  unwrap(await serverApiClient.post<Favorite>(ENDPOINTS.FAVORITES.ADD, data, authToken));

export const removeFavoriteServer = async (unitId: number, authToken: string) =>
  unwrap(await serverApiClient.delete<{ message: string }>(ENDPOINTS.FAVORITES.REMOVE(String(unitId)), authToken));
