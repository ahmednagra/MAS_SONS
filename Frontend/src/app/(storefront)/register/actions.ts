'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { registerServer } from '@/services/auth';
import { applySessionCookies } from '@/lib/session';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  full_name: z.string().min(1).max(255),
  phone: z.string().optional(),
});

export interface RegisterFormState {
  status: 'idle' | 'error';
  message?: string;
}

export async function register(_prev: RegisterFormState, formData: FormData): Promise<RegisterFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = RegisterSchema.safeParse({ ...raw, phone: raw.phone || undefined });
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message };

  try {
    const tokens = await registerServer(parsed.data);
    await applySessionCookies(tokens);
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Registration failed' };
  }
  redirect('/account');
}
