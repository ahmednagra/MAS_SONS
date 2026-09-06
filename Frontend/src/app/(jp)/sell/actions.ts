'use server';
import { z } from 'zod';
import { submitBuybackLeadServer } from '@/services/buyback-leads';

const Schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  vehicle_or_equipment_description: z.string().min(1),
});

export async function submitBuybackLead(_prev: unknown, formData: FormData) {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await submitBuybackLeadServer(parsed.data);
    return { data: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '送信に失敗しました' };
  }
}
