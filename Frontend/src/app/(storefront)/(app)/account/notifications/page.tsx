import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { getAccessToken } from '@/lib/session';
import { getNotificationPreferencesServer } from '@/services/notifications';
import { NotificationPreferencesForm } from '@/components/account/NotificationPreferencesForm';

export const metadata: Metadata = { title: 'Notification settings — M.A.S & SONS' };

// Reads the session cookie, so it stays out of the page's top level and behind
// Suspense (docs/authentication-with-cache-components.md), matching account/page.tsx.
async function PreferencesContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account/notifications');

  const token = await getAccessToken();
  const preferences = await getNotificationPreferencesServer(token!);
  return <NotificationPreferencesForm preferences={preferences} />;
}

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Notification settings</h1>
      <Suspense fallback={<div className="mt-6 h-24 animate-pulse rounded-sm bg-surface" />}>
        <PreferencesContent />
      </Suspense>
    </div>
  );
}
