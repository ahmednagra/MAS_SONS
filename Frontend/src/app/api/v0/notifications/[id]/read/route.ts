import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { markNotificationReadServer } from '@/services/notifications/notifications.server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const { id } = await params;
    const notification = await markNotificationReadServer(Number(id), authToken);
    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('POST /api/v0/notifications/[id]/read failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
