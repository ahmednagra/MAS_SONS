import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { getFavoritesServer, addFavoriteServer } from '@/services/favorites/favorites.server';

export async function GET(request: NextRequest) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const favorites = await getFavoritesServer(authToken);
    return NextResponse.json(favorites, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v0/favorites failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const unitId = Number(body?.unit_id);
  if (!Number.isInteger(unitId) || unitId <= 0) {
    return NextResponse.json({ error: 'unit_id must be a positive integer', error_code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  try {
    const favorite = await addFavoriteServer({ unit_id: unitId }, authToken);
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('POST /api/v0/favorites failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
