import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { StockSearchParams, Unit, UpdateUnitInput } from '@/types/stock';

export const getStockList = async (params: StockSearchParams) =>
  unwrap(await nextjsApiClient.get<{ items: Unit[]; total: number }>(`/api/v0${ENDPOINTS.STOCK.LIST}${toQueryString(params)}`));

export const getStock = async (id: string) => unwrap(await nextjsApiClient.get<Unit>(`/api/v0${ENDPOINTS.STOCK.DETAIL(id)}`));

export const updateStock = async (id: string, data: UpdateUnitInput) =>
  unwrap(await nextjsApiClient.patch<Unit>(`/api/v0${ENDPOINTS.STOCK.UPDATE(id)}`, data));
