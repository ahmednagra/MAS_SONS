import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { StockSearchParams, Unit, UpdateUnitInput } from '@/types/stock';

export const searchStockServer = async (params: StockSearchParams) =>
  unwrap(await serverApiClient.get<{ items: Unit[]; total: number }>(`${ENDPOINTS.STOCK.LIST}${toQueryString(params)}`));

export async function getUnitBySlugServer(slug: string): Promise<Unit | null> {
  const result = await serverApiClient.get<Unit>(ENDPOINTS.STOCK.BY_SLUG(slug));
  if (result.status === 404) return null;
  return unwrap(result);
}

export const getUnitServer = async (id: string, authToken: string) =>
  unwrap(await serverApiClient.get<Unit>(ENDPOINTS.STOCK.DETAIL(id), authToken));

export const updateUnitServer = async (id: string, data: UpdateUnitInput, authToken: string) =>
  unwrap(await serverApiClient.patch<Unit>(ENDPOINTS.STOCK.UPDATE(id), data, authToken));

export const getActiveStockCountServer = async () =>
  unwrap(await serverApiClient.get<{ count: number }>(`${ENDPOINTS.STOCK.LIST}/count`)).count;

export const getStockSlugsPageServer = async (params: { offset: number; limit: number }) =>
  unwrap(await serverApiClient.get<Array<{ slug: string; updatedAt: string }>>(`${ENDPOINTS.STOCK.LIST}/slugs${toQueryString(params)}`));
