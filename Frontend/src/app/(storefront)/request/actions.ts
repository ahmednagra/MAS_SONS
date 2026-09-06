'use server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { submitSourcingRequestServer } from '@/services/sourcing-requests';
import { logger } from '@/lib/logger';

const optional = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : null));

const Schema = z.object({
  contact_name: z.string().trim().min(2, 'Tell us your name').max(120),
  contact_email: z.string().trim().email('Enter a valid email'),
  contact_whatsapp: optional(40),
  make: optional(60),
  model_description: z.string().trim().min(5, 'Describe what you are looking for').max(2000),
  min_auction_grade: z.enum(['5', '4.5', '4', '3.5', '3', 'R', 'RA']).nullable(),
  budget_max_usd: z.number().positive().max(10_000_000).nullable(),
  destination_country: z.string().trim().length(2).toUpperCase().nullable(),
  quote_type: z.enum(['FOB', 'CFR', 'CIF']).nullable(),
  buying_timeframe: optional(60),
});

export type RequestFormState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; id: number };

const text = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === 'string' ? v : '';
};
const nullable = (formData: FormData, key: string) => text(formData, key) || null;

export async function submitSourcingRequest(_prev: RequestFormState, formData: FormData): Promise<RequestFormState> {
  // Honeypot — bots fill every field; humans never see this one.
  if (text(formData, 'company_website')) return { status: 'success', id: 0 };

  const budgetRaw = text(formData, 'budget_max_usd').replace(/[,\s]/g, '');
  const parsed = Schema.safeParse({
    contact_name: text(formData, 'contact_name'),
    contact_email: text(formData, 'contact_email'),
    contact_whatsapp: text(formData, 'contact_whatsapp'),
    make: text(formData, 'make'),
    model_description: text(formData, 'model_description'),
    min_auction_grade: nullable(formData, 'min_auction_grade'),
    budget_max_usd: budgetRaw ? Number(budgetRaw) : null,
    destination_country: nullable(formData, 'destination_country'),
    quote_type: nullable(formData, 'quote_type'),
    buying_timeframe: text(formData, 'buying_timeframe'),
  });
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the form' };

  const authToken = (await cookies()).get('access_token')?.value ?? null;
  try {
    const created = await submitSourcingRequestServer(parsed.data, authToken);
    return { status: 'success', id: created.id };
  } catch (error) {
    logger.error('submitSourcingRequest failed', error instanceof Error ? error.message : 'Unknown error');
    return { status: 'error', message: 'We could not send your request. Please try again, or contact us directly.' };
  }
}
