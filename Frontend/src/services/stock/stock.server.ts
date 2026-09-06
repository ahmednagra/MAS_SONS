import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { StockFacets, StockListResponse, StockSearchParams, Unit, UnitCategory, UnitInsights, UnitPriceUpdate, UnitSummary } from '@/types/stock';

// Backend caps this batch at 50 ids (400s past that) — trim defensively so a caller
// with an unexpectedly large list (e.g. favorites) degrades instead of erroring.
const MAX_BY_IDS = 50;

export const searchStockServer = async (params: StockSearchParams) =>
  unwrap(await serverApiClient.get<StockListResponse>(`${ENDPOINTS.STOCK.LIST}${toQueryString(params)}`));

export async function getUnitBySlugServer(slug: string): Promise<Unit | null> {
  const result = await serverApiClient.get<Unit>(ENDPOINTS.STOCK.BY_SLUG(slug));
  if (result.status === 404) return null;
  return unwrap(result);
}

export async function getUnitInsightsServer(slug: string): Promise<UnitInsights | null> {
  const result = await serverApiClient.get<UnitInsights>(ENDPOINTS.STOCK.INSIGHTS(slug));
  if (result.status === 404) return null;
  return unwrap(result);
}

// The only unit mutation the backend exposes — staff-only.
export const updateUnitPriceServer = async (id: number, data: UnitPriceUpdate, authToken: string) =>
  unwrap(await serverApiClient.patch<Unit>(ENDPOINTS.STOCK.ADMIN_UPDATE_PRICE(String(id)), data, authToken));

export const getActiveStockCountServer = async () =>
  unwrap(await serverApiClient.get<{ count: number }>(ENDPOINTS.STOCK.COUNT)).count;

export const getStockFacetsServer = async (category?: UnitCategory) =>
  unwrap(await serverApiClient.get<StockFacets>(`${ENDPOINTS.STOCK.FACETS}${category ? `?category=${category}` : ''}`));

const SITEMAP_PAGE_SIZE = 100; // matches the backend's StockSearchParams.limit cap (le=100)

// There is no dedicated slugs-listing endpoint — GET /stock is the only enumerable source of
// every live unit's slug, bounded to 100/page, so this walks it with cursor pagination instead
// of a single large-limit call to a route that doesn't exist. In practice the catalog is far
// below one 50k sitemap shard, so `offset` is always 0 and this never over-fetches; it's written
// to still return the right slice if that ever changes, just not efficiently for offset > 0.
export async function getStockSlugsPageServer(params: { offset: number; limit: number }): Promise<Array<{ slug: string; updatedAt: string }>> {
  const results: Array<{ slug: string; updatedAt: string }> = [];
  let cursor: number | undefined;
  let skipped = 0;

  while (results.length < params.limit) {
    const page = await searchStockServer({ cursor, limit: SITEMAP_PAGE_SIZE });
    if (!page.items.length) break;
    for (const unit of page.items) {
      if (skipped < params.offset) {
        skipped++;
        continue;
      }
      results.push({ slug: unit.slug, updatedAt: unit.created_at });
      if (results.length >= params.limit) break;
    }
    if (page.next_cursor == null) break;
    cursor = page.next_cursor;
  }
  return results;
}

// FastAPI's `ids: list[int] = Query(...)` expects repeated keys (?ids=1&ids=2), not a
// comma-joined value — toQueryString's `.set()` can't express that, so this builds its own.
export async function getUnitsByIdsServer(ids: number[]): Promise<UnitSummary[]> {
  if (!ids.length) return [];
  const capped = ids.slice(0, MAX_BY_IDS);
  const query = capped.map((id) => `ids=${id}`).join('&');
  const result = await serverApiClient.get<StockListResponse>(`${ENDPOINTS.STOCK.BY_IDS}?${query}`);
  return unwrap(result).items;
}
