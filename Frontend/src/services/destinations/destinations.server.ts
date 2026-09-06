import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Destination } from '@/types/destinations';

export const listDestinationsServer = async () =>
  unwrap(await serverApiClient.get<Destination[]>(ENDPOINTS.DESTINATIONS.LIST));

export async function getDestinationInfoServer(country: string): Promise<Destination | null> {
  const result = await serverApiClient.get<Destination>(ENDPOINTS.DESTINATIONS.INFO(country));
  if (result.status === 404) return null;
  return unwrap(result);
}
