'use client';
import { useActionState } from 'react';
import { Button, FormField, Input } from '@/components/ui';
import { submitFulfillmentDetails, type FulfillmentFormState } from '@/app/(storefront)/(app)/account/orders/[id]/actions';

export function OrderFulfillmentForm({ orderId }: { orderId: number }) {
  const action = submitFulfillmentDetails.bind(null, orderId);
  const [state, formAction, pending] = useActionState<FulfillmentFormState, FormData>(action, { status: 'idle' });

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <FormField label="Consignee name">
        <Input name="consignee_name" required maxLength={255} className="w-full" />
      </FormField>
      <FormField label="Consignee phone">
        <Input name="consignee_phone" required maxLength={32} className="w-full" />
      </FormField>
      <FormField label="Address line 1">
        <Input name="shipping_address_line1" required maxLength={255} className="w-full" />
      </FormField>
      <FormField label="Address line 2 (optional)">
        <Input name="shipping_address_line2" maxLength={255} className="w-full" />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="City">
          <Input name="shipping_city" required maxLength={120} className="w-full" />
        </FormField>
        <FormField label="State / province (optional)">
          <Input name="shipping_state_province" maxLength={120} className="w-full" />
        </FormField>
        <FormField label="Postal code (optional)">
          <Input name="shipping_postal_code" maxLength={32} className="w-full" />
        </FormField>
      </div>
      {state.status === 'error' && <p role="alert" className="text-sm text-accent">{state.message}</p>}
      {state.status === 'success' && <p className="text-sm text-ink">{state.message}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save shipping details'}
      </Button>
    </form>
  );
}
