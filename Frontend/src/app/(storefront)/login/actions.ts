'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { loginServer, requestMagicLinkServer } from '@/services/auth';
import { applySessionCookies } from '@/lib/session';

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export interface LoginFormState {
  status: 'idle' | 'error';
  message?: string;
}

export async function login(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message };

  try {
    const tokens = await loginServer(parsed.data);
    await applySessionCookies(tokens);
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Incorrect email or password' };
  }
  redirect('/account');
}

const MagicLinkSchema = z.object({ email: z.string().email() });

export interface MagicLinkFormState {
  status: 'idle' | 'sent' | 'error';
  message?: string;
}

export async function requestMagicLink(_prev: MagicLinkFormState, formData: FormData): Promise<MagicLinkFormState> {
  const parsed = MagicLinkSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message };

  try {
    await requestMagicLinkServer(parsed.data);
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not send the link' };
  }
  return { status: 'sent', message: "If that email has an account, we've sent a sign-in link." };
}
