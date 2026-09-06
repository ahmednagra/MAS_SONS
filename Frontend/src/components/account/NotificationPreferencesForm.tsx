'use client';
import { useActionState } from 'react';
import { Button } from '@/components/ui';
import { updateNotificationPreferences } from '@/app/(storefront)/(app)/account/notifications/actions';
import type { PreferencesFormState } from '@/app/(storefront)/(app)/account/notifications/actions';
import type { NotificationPreference } from '@/types/notifications';

export function NotificationPreferencesForm({ preferences }: { preferences: NotificationPreference }) {
  const [state, formAction, pending] = useActionState<PreferencesFormState, FormData>(updateNotificationPreferences, { status: 'idle' });

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input type="checkbox" name="is_email_paused" defaultChecked={preferences.is_email_paused} className="h-4 w-4 rounded-sm border-line" />
        Pause all email notifications
      </label>
      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input type="checkbox" name="marketing_opt_in" defaultChecked={preferences.marketing_opt_in} className="h-4 w-4 rounded-sm border-line" />
        Receive marketing emails
      </label>
      {state.status === 'error' && <p role="alert" className="text-sm text-accent">{state.message}</p>}
      {state.status === 'success' && <p className="text-sm text-ink">{state.message}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Saving…' : 'Save preferences'}
      </Button>
    </form>
  );
}
