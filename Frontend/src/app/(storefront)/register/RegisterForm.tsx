'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { Button, FormField, Input } from '@/components/ui';
import { register, type RegisterFormState } from './actions';

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterFormState, FormData>(register, { status: 'idle' });

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField label="Full name">
        <Input name="full_name" required minLength={1} maxLength={255} autoComplete="name" className="w-full" />
      </FormField>
      <FormField label="Email">
        <Input name="email" type="email" required autoComplete="email" className="w-full" />
      </FormField>
      <FormField label="Phone (optional)">
        <Input name="phone" type="tel" autoComplete="tel" className="w-full" />
      </FormField>
      <FormField label="Password" error={state.status === 'error' ? state.message : undefined}>
        <Input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="w-full" />
      </FormField>
      <Button type="submit" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</Button>
      <p className="text-sm text-sub">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
