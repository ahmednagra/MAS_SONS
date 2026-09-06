'use server';
import { z } from 'zod';
import { getAccessToken } from '@/lib/session';
import { updateNotificationPreferencesServer } from '@/services/notifications';

// Mirrors NotificationPreferenceUpdate (app/Schemas/notification_preference.py) — only the
// fields this form actually exposes; channel_preferences is left to its existing value.
const Schema = z.object({
  is_email_paused: z.enum(['on']).optional().transform((v) => v === 'on'),
  marketing_opt_in: z.enum(['on']).optional().transform((v) => v === 'on'),
});

export interface PreferencesFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

export async function updateNotificationPreferences(_prev: PreferencesFormState, formData: FormData): Promise<PreferencesFormState> {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message };

  const token = await getAccessToken();
  if (!token) return { status: 'error', message: 'Your session expired — please sign in again.' };

  try {
    await updateNotificationPreferencesServer(
      { is_email_paused: parsed.data.is_email_paused ?? false, marketing_opt_in: parsed.data.marketing_opt_in ?? false },
      token,
    );
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not save preferences' };
  }
  return { status: 'success', message: 'Preferences saved.' };
}
