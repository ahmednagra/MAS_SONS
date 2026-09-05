import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { searchStockServer } from '@/services/stock/stock.server';

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const result = await searchStockServer(params);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v0/stock failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
