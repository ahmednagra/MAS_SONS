import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { removeFavoriteServer } from '@/services/favorites/favorites.server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ unitId: string }> }) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  const { unitId } = await params;
  const parsedId = Number(unitId);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return NextResponse.json({ error: 'unitId must be a positive integer', error_code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  try {
    const result = await removeFavoriteServer(parsedId, authToken);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('DELETE /api/v0/favorites/[unitId] failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
