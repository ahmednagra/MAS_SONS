'use client';
import { useActionState } from 'react';
import { Button, FormField, Input } from '@/components/ui';
import { updateUnitPrice } from './actions';

export function PriceForm({ unitId, initialPrice }: { unitId: number; initialPrice: number }) {
  const [state, action, pending] = useActionState((_prev: unknown, formData: FormData) => updateUnitPrice(unitId, formData), null);
  return (
    <form action={action} className="flex items-end gap-2">
      <FormField label="Price (USD)" error={state?.error}>
        <Input name="price" type="number" defaultValue={initialPrice} required className="w-40" />
      </FormField>
      <Button disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
    </form>
  );
}
