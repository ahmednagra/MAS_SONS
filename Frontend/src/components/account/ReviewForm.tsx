'use client';
import { useActionState } from 'react';
import { Button, FormField, Input } from '@/components/ui';
import { submitReview, type ReviewFormState } from '@/app/(storefront)/(app)/account/reviews/new/actions';

const RATINGS = [5, 4, 3, 2, 1] as const;

export function ReviewForm({
  quoteRequestId,
  defaultName,
  defaultCountry,
  unitLabel,
}: {
  quoteRequestId: number;
  defaultName: string;
  defaultCountry?: string;
  unitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(submitReview, { status: 'idle' });

  if (state.status === 'success') return <p className="mt-4 text-sm text-ink">{state.message}</p>;

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <input type="hidden" name="quote_request_id" value={quoteRequestId} />
      <input type="hidden" name="destination_country" value={defaultCountry ?? ''} />
      <p className="text-sm text-sub">Reviewing your purchase: <span className="font-medium text-ink">{unitLabel}</span></p>
      <FormField label="Your name">
        <Input name="reviewer_name" defaultValue={defaultName} required maxLength={255} className="w-full" />
      </FormField>
      <fieldset>
        <legend className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Rating (optional)</legend>
        <div className="flex gap-3">
          {RATINGS.map((r) => (
            <label key={r} className="flex items-center gap-1.5 text-sm text-ink">
              <input type="radio" name="rating" value={r} className="h-4 w-4" />
              {r}
            </label>
          ))}
        </div>
      </fieldset>
      <FormField label="Your review">
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="w-full rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          placeholder="How was the unit, the shipping, and the process overall?"
        />
      </FormField>
      {state.status === 'error' && <p role="alert" className="text-sm text-accent">{state.message}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  );
}
