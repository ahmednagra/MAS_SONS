import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { DestinationInfo } from '@/types/destinations';

export const getDestinationInfoServer = async (country: string) =>
  unwrap(await serverApiClient.get<DestinationInfo>(ENDPOINTS.DESTINATIONS.INFO(country)));
