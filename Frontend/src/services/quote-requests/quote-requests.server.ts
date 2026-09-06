import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CreateQuoteRequest, QuoteRequest } from '@/types/quote-requests';

export const submitQuoteRequestServer = async (data: CreateQuoteRequest, authToken: string | null) =>
  unwrap(await serverApiClient.post<QuoteRequest>(ENDPOINTS.QUOTE_REQUESTS.CREATE, data, authToken));

export const getQuoteRequestsServer = async (authToken: string) =>
  unwrap(await serverApiClient.get<QuoteRequest[]>(ENDPOINTS.QUOTE_REQUESTS.LIST, authToken));
