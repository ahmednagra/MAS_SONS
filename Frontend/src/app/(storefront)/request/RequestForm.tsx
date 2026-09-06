'use client';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useDestinationPreference } from '@/lib/destination-preference';
import { submitSourcingRequest, type RequestFormState } from './actions';
import type { Destination } from '@/types/destinations';

const field = 'mt-1 w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1';
const label = 'block text-[10.5px] font-semibold uppercase tracking-wider text-sub';

export interface RequestPrefill {
  make?: string;
  model?: string;
  destination?: string;
  unit?: string;
}

export function RequestForm({ destinations, prefill }: { destinations: Destination[]; prefill: RequestPrefill }) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(submitSourcingRequest, { status: 'idle' });
  const [preferred, setPreferred] = useDestinationPreference();
  // Until the buyer touches the select: URL prefill wins, then the remembered port.
  const [chosen, setChosen] = useState<string | null>(null);
  const destination = chosen ?? prefill.destination ?? preferred ?? '';

  if (state.status === 'success') {
    return (
      <div className="rounded-sm border border-line bg-surface p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Request received</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">We&rsquo;ll reply within one business day, JST.</h2>
        <p className="mt-3 text-sm leading-relaxed text-sub">
          {state.id > 0 && <>Your reference is <span className="font-semibold tabular-nums text-ink">#{state.id}</span>. </>}
          You&rsquo;ll get the real auction sheet or a written quote by email before anything is asked of you.
        </p>
        <Link href="/stock" className="mt-6 inline-block text-sm font-semibold text-ink hover:text-accent">Keep browsing stock →</Link>
      </div>
    );
  }

  const description = prefill.unit
    ? `Quote for ${prefill.make ?? ''} ${prefill.model ?? ''} (stock ref ${prefill.unit}).`.replace(/\s+/g, ' ').trim()
    : prefill.model ?? '';

  return (
    <form action={action} className="grid gap-5 rounded-sm border border-line bg-surface p-6 sm:p-8">
      <input suppressHydrationWarning type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-ink">What you&rsquo;re looking for</legend>
        <label>
          <span className={label}>Make</span>
          <Input name="make" defaultValue={prefill.make ?? ''} placeholder="Toyota" className="mt-1 w-full" maxLength={60} />
        </label>
        <label>
          <span className={label}>Minimum auction grade</span>
          <select suppressHydrationWarning name="min_auction_grade" className={field} defaultValue="">
            <option value="">Any</option>
            {['5', '4.5', '4', '3.5', '3'].map((g) => <option key={g} value={g}>{g} and up</option>)}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={label}>Model, year range, must-haves</span>
          <textarea suppressHydrationWarning
            name="model_description"
            required
            minLength={5}
            maxLength={2000}
            rows={4}
            defaultValue={description}
            placeholder="e.g. HiAce Super GL, 2016 or newer, diesel, under 120,000 km, RHD"
            className={field}
          />
        </label>
        <label>
          <span className={label}>Max budget (USD)</span>
          <Input name="budget_max_usd" type="number" min={0} step={500} placeholder="15,000" className="mt-1 w-full" />
        </label>
        <label>
          <span className={label}>When are you buying?</span>
          <select suppressHydrationWarning name="buying_timeframe" className={field} defaultValue="">
            <option value="">Not sure yet</option>
            <option value="this_month">This month</option>
            <option value="1_3_months">In 1–3 months</option>
            <option value="3_plus_months">Later than 3 months</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold text-ink">Where it ships</legend>
        <label>
          <span className={label}>Destination port</span>
          <select suppressHydrationWarning
            name="destination_country"
            value={destination}
            onChange={(e) => {
              setChosen(e.target.value);
              if (e.target.value) setPreferred(e.target.value);
            }}
            className={field}
          >
            <option value="">Not decided / not listed</option>
            {destinations.map((d) => (
              <option key={d.country_code} value={d.country_code}>{d.primary_port}, {d.country_name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>Quote as</span>
          <select suppressHydrationWarning name="quote_type" className={field} defaultValue={destination ? 'CFR' : 'FOB'}>
            <option value="FOB">FOB — I arrange freight</option>
            <option value="CFR">C&amp;F — freight included</option>
            <option value="CIF">CIF — freight and insurance included</option>
          </select>
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-2 text-sm font-semibold text-ink">How to reach you</legend>
        <label>
          <span className={label}>Name</span>
          <Input name="contact_name" required minLength={2} maxLength={120} autoComplete="name" className="mt-1 w-full" />
        </label>
        <label>
          <span className={label}>Email</span>
          <Input name="contact_email" type="email" required autoComplete="email" className="mt-1 w-full" />
        </label>
        <label>
          <span className={label}>WhatsApp (optional)</span>
          <Input name="contact_whatsapp" type="tel" autoComplete="tel" placeholder="+254 …" maxLength={40} className="mt-1 w-full" />
        </label>
      </fieldset>

      {state.status === 'error' && (
        <p role="alert" className="text-sm font-medium text-accent">{state.message}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-sub">No account needed. We never share your details.</p>
        <Button type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send request'}</Button>
      </div>
    </form>
  );
}
