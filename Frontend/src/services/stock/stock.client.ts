import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { StockFacets, StockListResponse, StockSearchParams } from '@/types/stock';

export const getStockList = async (params: StockSearchParams) =>
  unwrap(await nextjsApiClient.get<StockListResponse>(`/api/v0${ENDPOINTS.STOCK.LIST}${toQueryString(params)}`));

/** Option counts that cascade from the given filters (same params as the list). */
export const getStockFacets = async (params: StockSearchParams) =>
  unwrap(await nextjsApiClient.get<StockFacets>(`/api/v0${ENDPOINTS.STOCK.FACETS}${toQueryString(params)}`));
