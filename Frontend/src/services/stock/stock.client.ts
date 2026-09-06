import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { StockListResponse, StockSearchParams } from '@/types/stock';

export const getStockList = async (params: StockSearchParams) =>
  unwrap(await nextjsApiClient.get<StockListResponse>(`/api/v0${ENDPOINTS.STOCK.LIST}${toQueryString(params)}`));
