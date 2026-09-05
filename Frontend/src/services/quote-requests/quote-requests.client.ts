import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { CreateQuoteRequest, QuoteRequest } from '@/types/quote-requests';

export const submitQuoteRequest = async (data: CreateQuoteRequest) =>
  unwrap(await nextjsApiClient.post<QuoteRequest>(`/api/v0${ENDPOINTS.QUOTE_REQUESTS.CREATE}`, data));

export const getQuoteRequests = async (userId: string) =>
  unwrap(await nextjsApiClient.get<QuoteRequest[]>(`/api/v0${ENDPOINTS.QUOTE_REQUESTS.LIST}?userId=${userId}`));
