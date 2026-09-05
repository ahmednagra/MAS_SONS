'use server';
import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';
import { z } from 'zod';
import { updateUnitServer } from '@/services/stock/stock.server';

const Schema = z.object({ price: z.number().positive() });

export async function updateUnitPrice(unitId: string, formData: FormData) {
  const parsed = Schema.safeParse({ price: Number(formData.get('price')) });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const authToken = (await cookies()).get('access_token')?.value;
  if (!authToken) return { error: 'Unauthorized' };

  const unit = await updateUnitServer(unitId, parsed.data, authToken);
  updateTag(`unit:${unit.slug}`);
  return { data: unit };
}
