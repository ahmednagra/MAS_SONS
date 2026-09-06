'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getAccessToken } from '@/lib/session';
import { submitFulfillmentDetailsServer } from '@/services/orders';

// Mirrors OrderFulfillmentDetailInput (app/Schemas/order.py) field-for-field. The identity
// document isn't part of this input — the backend response exposes identity_document_url/
// identity_verified_at as staff-set fields with no buyer-facing write path yet, so this form
// only collects what the endpoint actually accepts.
const Schema = z.object({
  consignee_name: z.string().trim().min(1).max(255),
  consignee_phone: z.string().trim().min(1).max(32),
  shipping_address_line1: z.string().trim().min(1).max(255),
  shipping_address_line2: z.string().trim().max(255).optional(),
  shipping_city: z.string().trim().min(1).max(120),
  shipping_state_province: z.string().trim().max(120).optional(),
  shipping_postal_code: z.string().trim().max(32).optional(),
});

export interface FulfillmentFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

export async function submitFulfillmentDetails(
  orderId: number,
  _prev: FulfillmentFormState,
  formData: FormData,
): Promise<FulfillmentFormState> {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message };

  const token = await getAccessToken();
  if (!token) redirect('/login');

  try {
    await submitFulfillmentDetailsServer(orderId, parsed.data, token);
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not save these details' };
  }
  return { status: 'success', message: 'Shipping details saved.' };
}
