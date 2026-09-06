import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { extractBearerToken } from '@/lib/auth-utils';
import { submitQuoteRequestServer } from '@/services/quote-requests/quote-requests.server';

// Mirrors QuoteRequestCreate (app/Schemas/quote_request.py) field-for-field.
const Schema = z.object({
  unit_id: z.number().int().positive(),
  contact_name: z.string().trim().min(2).max(120),
  contact_email: z.string().trim().email().max(254),
  contact_whatsapp: z.string().trim().max(32).optional().nullable(),
  destination_country: z.string().trim().length(2).transform((v) => v.toUpperCase()),
  incoterm: z.enum(['FOB', 'CFR', 'CIF']),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const authToken = extractBearerToken(request);

  const parsed = Schema.safeParse(await request.json().catch(() => null));
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
