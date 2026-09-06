'use server';
import { cookies } from 'next/headers';
import { updateTag } from 'next/cache';
import { z } from 'zod';
import { updateUnitPriceServer } from '@/services/stock/stock.server';

const Schema = z.object({ price_usd: z.number().positive() });

export async function updateUnitPrice(unitId: number, formData: FormData) {
  const parsed = Schema.safeParse({ price_usd: Number(formData.get('price')) });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const authToken = (await cookies()).get('access_token')?.value;
  if (!authToken) return { error: 'Unauthorized' };

  const unit = await updateUnitPriceServer(unitId, parsed.data, authToken);
  updateTag(`unit:${unit.slug}`);
  // Home rails and facets render this unit too.
  updateTag('stock');
  return { data: unit };
}
