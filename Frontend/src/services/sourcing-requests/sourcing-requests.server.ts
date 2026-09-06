import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CreateSourcingRequest, SourcingRequest } from '@/types/sourcing-requests';

export const submitSourcingRequestServer = async (data: CreateSourcingRequest, authToken: string | null) =>
  unwrap(await serverApiClient.post<SourcingRequest>(ENDPOINTS.SOURCING_REQUESTS.CREATE, data, authToken));
