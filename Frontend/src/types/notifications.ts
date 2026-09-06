// Mirrors app/Schemas/notification.py and notification_preference.py.
export interface Notification {
  id: number;
  notification_type: string;
  category: string;
  priority: string;
  title: string;
  body: string;
  action_url?: string | null;
  status: string;
  read_at?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unread_count: number;
  next_cursor?: number | null;
}

export interface NotificationPreference {
  channel_preferences: Record<string, unknown>;
  is_email_paused: boolean;
  marketing_opt_in: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  timezone: string;
  digest_frequency: string;
}

export interface NotificationPreferenceUpdate {
  channel_preferences?: Record<string, unknown>;
  is_email_paused?: boolean;
  marketing_opt_in?: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  timezone?: string;
  digest_frequency?: string;
}
