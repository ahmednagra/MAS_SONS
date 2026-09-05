'use client';
import { useActionState } from 'react';
import { Button, FormField, Input } from '@/components/ui';
import { submitBuybackLead } from './actions';

export function LeadForm() {
  const [state, action, pending] = useActionState(submitBuybackLead, null);

  if (state?.data) return <p>お問い合わせありがとうございます。担当者よりご連絡いたします。</p>;

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm">
      <FormField label="お名前"><Input name="name" required /></FormField>
      <FormField label="電話番号"><Input name="phone" required /></FormField>
      <FormField label="車両・重機の情報"><Input name="vehicleOrEquipment" required /></FormField>
      <Button disabled={pending}>{pending ? '送信中…' : '無料査定を依頼する'}</Button>
      {state?.error && <p role="alert" className="text-red-600">{state.error}</p>}
    </form>
  );
}
