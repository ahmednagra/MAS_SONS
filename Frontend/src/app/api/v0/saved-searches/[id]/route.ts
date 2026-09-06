import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { updateSavedSearchServer, deleteSavedSearchServer } from '@/services/saved-searches/saved-searches.server';

const Schema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  filters: z.record(z.string(), z.string()).optional(),
  alert_enabled: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message, error_code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  try {
    const { id } = await params;
    const search = await updateSavedSearchServer(Number(id), parsed.data, authToken);
    return NextResponse.json(search, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('PATCH /api/v0/saved-searches/[id] failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const { id } = await params;
    const result = await deleteSavedSearchServer(Number(id), authToken);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('DELETE /api/v0/saved-searches/[id] failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
