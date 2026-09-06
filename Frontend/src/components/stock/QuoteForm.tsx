'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { Button, FormField, Input, Select } from '@/components/ui';
import { useSubmitQuoteRequest } from '@/hooks/queries';
import { DESTINATION_EVENT } from '@/components/stock/ShippingEstimator';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';
import type { Incoterm } from '@/types/quote-requests';

const INCOTERMS: Array<{ v: Incoterm; t: string; d: string }> = [
  { v: 'FOB', t: 'FOB', d: 'Price on board at the Japanese port. You arrange freight.' },
  { v: 'CFR', t: 'C&F', d: 'Vehicle + ocean freight to your port. Most popular.' },
  { v: 'CIF', t: 'CIF', d: 'C&F plus marine insurance for full cover in transit.' },
];

export function QuoteForm({ unitId, unitTitle, destinations }: { unitId: number; unitTitle: string; destinations: Destination[] }) {
  const [preferred] = useDestinationPreference();
  const [picked, setPicked] = useState<string | null>(null);
  const country = picked ?? (preferred && destinations.some((d) => d.country_code === preferred) ? preferred : destinations[0]?.country_code ?? '');
  const [incoterm, setIncoterm] = useState<Incoterm>('CFR');
  const mutation = useSubmitQuoteRequest();

  useEffect(() => {
    const onPick = (e: Event) => setPicked((e as CustomEvent<string>).detail);
    window.addEventListener(DESTINATION_EVENT, onPick);
    return () => window.removeEventListener(DESTINATION_EVENT, onPick);
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const whatsapp = String(fd.get('contact_whatsapp') ?? '').trim();
    const notes = String(fd.get('notes') ?? '').trim();
    mutation.mutate({
      unit_id: unitId,
      contact_name: String(fd.get('contact_name') ?? '').trim(),
      contact_email: String(fd.get('contact_email') ?? '').trim(),
      contact_whatsapp: whatsapp || null,
      destination_country: country,
      incoterm,
      notes: notes || null,
    });
  };

  if (mutation.isSuccess) {
    return (
      <div className="rounded-sm border border-accent/40 bg-surface p-6" role="status">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">Request received</p>
        <p className="mt-2 text-lg font-semibold text-ink">Quote #{mutation.data.id} for {unitTitle}</p>
        <p className="mt-1 text-sm text-sub">
          We&rsquo;ll email an itemised {mutation.data.incoterm} quotation to {mutation.data.contact_email} within one business day (JST), including freight, inspection, and document fees.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-sm border border-line bg-surface p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name">
          <Input name="contact_name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your name" />
        </FormField>
        <FormField label="Email">
          <Input name="contact_email" type="email" required maxLength={254} autoComplete="email" placeholder="you@company.com" />
        </FormField>
        <FormField label="WhatsApp (optional)">
          <Input name="contact_whatsapp" type="tel" maxLength={32} autoComplete="tel" placeholder="+254 7xx xxx xxx" />
        </FormField>
        <FormField label="Destination">
          <Select value={country} onChange={(e) => setPicked(e.target.value)} required disabled={!destinations.length}>
            {destinations.length ? destinations.map((d) => (
              <option key={d.country_code} value={d.country_code}>{d.country_name} — {d.primary_port}</option>
            )) : <option value="">No destinations configured</option>}
          </Select>
        </FormField>
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wider text-sub">Quote basis</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {INCOTERMS.map((i) => (
            <label key={i.v} className={`cursor-pointer rounded-sm border p-3 text-sm transition-colors ${incoterm === i.v ? 'border-accent bg-accent/10' : 'border-line hover:border-sub'}`}>
              <input type="radio" name="incoterm" value={i.v} checked={incoterm === i.v} onChange={() => setIncoterm(i.v)} className="sr-only" />
              <span className="font-semibold text-ink">{i.t}</span>
              <span className="mt-1 block text-xs text-sub">{i.d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label="Message (optional)">
        <textarea
          name="notes" rows={3} maxLength={2000}
          placeholder="Ask for the auction sheet, extra photos, an inspection video, or tell us your budget."
          className="rounded-sm border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-sub focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        />
      </FormField>

      {mutation.isError && <p role="alert" className="mt-3 text-sm text-accent">{mutation.error.message || 'Something went wrong — please try again or WhatsApp us.'}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-sub">No obligation. Your details are used only to prepare this quotation.</p>
        <Button type="submit" disabled={mutation.isPending || !destinations.length} className="px-6 py-3">
          {mutation.isPending ? 'Sending…' : 'Send quote request'}
        </Button>
      </div>
    </form>
  );
}
