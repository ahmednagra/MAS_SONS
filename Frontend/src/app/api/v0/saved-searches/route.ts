import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { getSavedSearchesServer, createSavedSearchServer } from '@/services/saved-searches/saved-searches.server';

// Mirrors SavedSearchCreate (app/Schemas/saved_search.py) field-for-field.
const Schema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  filters: z.record(z.string(), z.string()),
  alert_enabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const searches = await getSavedSearchesServer(authToken);
    return NextResponse.json(searches, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v0/saved-searches failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message, error_code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  try {
    const search = await createSavedSearchServer(parsed.data, authToken);
    return NextResponse.json(search, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('POST /api/v0/saved-searches failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
