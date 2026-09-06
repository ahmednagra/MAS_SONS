import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Sign in — M.A.S & SONS' };

// Reads the session cookie, so it must sit behind Suspense and stream in rather
// than block the whole route's prerender (docs/authentication-with-cache-components.md).
async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect('/account');
  return null;
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-sub">Track your quotes, favorites, and orders.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
