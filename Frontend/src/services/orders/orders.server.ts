import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Order, OrderFulfillmentDetailInput, OrderFulfillmentDetailResponse } from '@/types/orders';

export const getOrdersServer = async (authToken: string, params: { cursor?: number; limit?: number } = {}) =>
  unwrap(await serverApiClient.get<Order[]>(`${ENDPOINTS.ORDERS.LIST}${toQueryString(params)}`, authToken));

// Treats 403 the same as 404: a buyer hitting another buyer's order id shouldn't be able to
// distinguish "not yours" from "doesn't exist" — fail closed rather than confirming existence.
export async function getOrderServer(id: number, authToken: string): Promise<Order | null> {
  const result = await serverApiClient.get<Order>(ENDPOINTS.ORDERS.DETAIL(String(id)), authToken);
  if (result.status === 404 || result.status === 403) return null;
  return unwrap(result);
}

export const submitFulfillmentDetailsServer = async (id: number, data: OrderFulfillmentDetailInput, authToken: string) =>
  unwrap(await serverApiClient.put<OrderFulfillmentDetailResponse>(ENDPOINTS.ORDERS.FULFILLMENT(String(id)), data, authToken));
