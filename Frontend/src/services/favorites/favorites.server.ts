import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';

export const getFavoriteListingsServer = async (userId: string, authToken: string) =>
  unwrap(await serverApiClient.get<string[]>(ENDPOINTS.FAVORITES.LIST(userId), authToken));
