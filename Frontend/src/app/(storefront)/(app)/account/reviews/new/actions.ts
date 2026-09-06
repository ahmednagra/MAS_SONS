'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAccessToken } from '@/lib/session';
import { getCurrentUser } from '@/lib/get-current-user';
import { getQuoteRequestsServer } from '@/services/quote-requests';
import { createReviewServer } from '@/services/reviews';

// Mirrors ReviewCreate (app/Schemas/review.py) for the fields this form exposes.
const Schema = z.object({
  quote_request_id: z.coerce.number().int().positive(),
  reviewer_name: z.string().trim().min(1).max(255),
  destination_country: z.string().trim().length(2).transform((v) => v.toUpperCase()).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  body: z.string().trim().min(10).max(2000),
});

export interface ReviewFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

export async function submitReview(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = Schema.safeParse({ ...raw, destination_country: raw.destination_country || undefined, rating: raw.rating || undefined });
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message };

  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const token = await getAccessToken();
  // Re-verify ownership server-side rather than trusting the hidden field — a buyer can
  // only review a quote request that is actually theirs and actually closed.
  const mine = await getQuoteRequestsServer(token!);
  const owned = mine.some((q) => q.id === parsed.data.quote_request_id && q.status === 'closed');
  if (!owned) return { status: 'error', message: 'This quote request is not eligible for a review.' };

  try {
    await createReviewServer(
      {
        quote_request_id: parsed.data.quote_request_id,
        reviewer_name: parsed.data.reviewer_name,
        destination_country: parsed.data.destination_country,
        rating: parsed.data.rating,
        body: parsed.data.body,
      },
      token!,
    );
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not submit your review' };
  }
  return { status: 'success', message: 'Thank you — your review has been submitted for approval.' };
}
