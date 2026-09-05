import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUnitServer, updateUnitServer } from '@/services/stock/stock.server';

const UpdateSchema = z.object({ price: z.number().positive().optional(), status: z.enum(['in_stock', 'sold', 'sourcing']).optional() });

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  try {
    const { id } = await params;
    const unit = await getUnitServer(id, authToken);
    return NextResponse.json(unit, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GET /api/v0/stock/[id] failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authToken = extractBearerToken(request);
  if (!authToken) return NextResponse.json({ error: 'Unauthorized', error_code: 'UNAUTHORIZED' }, { status: 401 });

  const parsed = UpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message, error_code: 'VALIDATION_ERROR' }, { status: 400 });

  try {
    const { id } = await params;
    const unit = await updateUnitServer(id, parsed.data, authToken);
    return NextResponse.json(unit, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('PATCH /api/v0/stock/[id] failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
