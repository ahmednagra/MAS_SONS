'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button, FormField, Input } from '@/components/ui';
import { login, requestMagicLink, type LoginFormState, type MagicLinkFormState } from './actions';

export function LoginForm() {
  const [mode, setMode] = useState<'password' | 'magic-link'>('password');
  const [state, action, pending] = useActionState<LoginFormState, FormData>(login, { status: 'idle' });
  const [linkState, linkAction, linkPending] = useActionState<MagicLinkFormState, FormData>(requestMagicLink, { status: 'idle' });

  if (mode === 'magic-link') {
    if (linkState.status === 'sent') return <p className="text-sm text-ink">{linkState.message}</p>;
    return (
      <form action={linkAction} className="flex flex-col gap-4">
        <FormField label="Email" error={linkState.status === 'error' ? linkState.message : undefined}>
          <Input name="email" type="email" required autoComplete="email" className="w-full" />
        </FormField>
        <Button type="submit" disabled={linkPending}>{linkPending ? 'Sending…' : 'Send sign-in link'}</Button>
        <button type="button" onClick={() => setMode('password')} className="text-sm text-sub underline-offset-4 hover:underline">
          Use a password instead
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField label="Email">
        <Input name="email" type="email" required autoComplete="email" className="w-full" />
      </FormField>
      <FormField label="Password" error={state.status === 'error' ? state.message : undefined}>
        <Input name="password" type="password" required autoComplete="current-password" className="w-full" />
      </FormField>
      <Button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</Button>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={() => setMode('magic-link')} className="text-sub underline-offset-4 hover:underline">
          Email me a sign-in link
        </button>
        <Link href="/register" className="font-medium text-ink underline-offset-4 hover:underline">Create an account</Link>
      </div>
    </form>
  );
}
