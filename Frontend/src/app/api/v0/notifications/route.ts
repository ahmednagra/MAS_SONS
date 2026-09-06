import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { getNotificationsServer } from '@/services/notifications/notifications.server';

export async function GET(request: NextRequest) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  const params = Object.fromEntries(request.nextUrl.searchParams);
  try {
    const result = await getNotificationsServer(authToken, {
      cursor: params.cursor ? Number(params.cursor) : undefined,
      limit: params.limit ? Number(params.limit) : undefined,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v0/notifications failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
