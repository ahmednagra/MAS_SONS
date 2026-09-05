import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { submitQuoteRequestServer } from '@/services/quote-requests/quote-requests.server';

const Schema = z.object({
  unitId: z.string().min(1),
  destinationCountry: z.string().length(2),
  incoterm: z.enum(['FOB', 'CFR', 'CIF']),
  email: z.string().email(),
  whatsapp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const authToken = extractBearerToken(request);

  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message, error_code: 'VALIDATION_ERROR' }, { status: 400 });
  }

  try {
    const quote = await submitQuoteRequestServer(parsed.data, authToken);
    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('POST /api/v0/quote-requests failed', message);
    return NextResponse.json({ error: message, error_code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
