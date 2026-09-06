import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { getAccessToken } from '@/lib/session';
import { getQuoteRequestsServer } from '@/services/quote-requests';
import { ReviewForm } from '@/components/account/ReviewForm';

export const metadata: Metadata = { title: 'Write a review — M.A.S & SONS' };

// Reads the session cookie AND searchParams, so both stay out of the page's top level and
// behind Suspense — searchParams is itself a request-time API under Cache Components, same
// as cookies() and dynamic-route params (docs/authentication-with-cache-components.md).
async function ReviewFormGate({ searchParams }: { searchParams: Promise<{ quote_request_id?: string }> }) {
  const { quote_request_id } = await searchParams;
  const qrId = Number(quote_request_id);
  if (!Number.isInteger(qrId) || qrId <= 0) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/account/reviews/new?quote_request_id=${qrId}`);

  const token = await getAccessToken();
  const mine = await getQuoteRequestsServer(token!);
  const quote = mine.find((q) => q.id === qrId && q.status === 'closed');
  if (!quote) notFound();

  const unitLabel = [quote.unit_year, quote.unit_make, quote.unit_model].filter(Boolean).join(' ') || `Order from quote #${quote.id}`;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Write a review</h1>
      <ReviewForm quoteRequestId={quote.id} defaultName={user.full_name} defaultCountry={quote.destination_country} unitLabel={unitLabel} />
    </>
  );
}

export default function NewReviewPage({ searchParams }: { searchParams: Promise<{ quote_request_id?: string }> }) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-sm bg-surface" />}>
      <ReviewFormGate searchParams={searchParams} />
    </Suspense>
  );
}
