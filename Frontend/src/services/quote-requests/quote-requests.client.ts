import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CreateQuoteRequest, QuoteRequest } from '@/types/quote-requests';

export const submitQuoteRequest = async (data: CreateQuoteRequest) =>
  unwrap(await nextjsApiClient.post<QuoteRequest>(`/api/v0${ENDPOINTS.QUOTE_REQUESTS.CREATE}`, data));

// Backend lists the caller's own requests from the auth token — no userId param.
export const getQuoteRequests = async () =>
  unwrap(await nextjsApiClient.get<QuoteRequest[]>(`/api/v0${ENDPOINTS.QUOTE_REQUESTS.LIST}`));
