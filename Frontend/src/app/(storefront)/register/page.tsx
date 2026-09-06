import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = { title: 'Create an account — M.A.S & SONS' };

// Reads the session cookie, so it must sit behind Suspense and stream in rather
// than block the whole route's prerender (docs/authentication-with-cache-components.md).
async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect('/account');
  return null;
}

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create an account</h1>
      <p className="mt-2 text-sm text-sub">Save favorites, track quotes, and manage orders.</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </div>
  );
}
