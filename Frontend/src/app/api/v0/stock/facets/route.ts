import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getStockFacetsServer } from '@/services/stock/stock.server';

/** Cascaded option counts for the filter panel; accepts the same query params as /api/v0/stock. */
export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const facets = await getStockFacetsServer(params);
    return NextResponse.json(facets, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v0/stock/facets failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
