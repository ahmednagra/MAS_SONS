import { serverApiClient } from '@/lib/server-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Notification, NotificationListResponse, NotificationPreference, NotificationPreferenceUpdate } from '@/types/notifications';

export const getNotificationsServer = async (authToken: string, params: { cursor?: number; limit?: number } = {}) =>
  unwrap(await serverApiClient.get<NotificationListResponse>(`${ENDPOINTS.NOTIFICATIONS.LIST}${toQueryString(params)}`, authToken));

export const markNotificationReadServer = async (id: number, authToken: string) =>
  unwrap(await serverApiClient.post<Notification>(ENDPOINTS.NOTIFICATIONS.MARK_READ(String(id)), undefined, authToken));

export const markAllNotificationsReadServer = async (authToken: string) =>
  unwrap(await serverApiClient.post<{ message: string }>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, undefined, authToken));

export const getNotificationPreferencesServer = async (authToken: string) =>
  unwrap(await serverApiClient.get<NotificationPreference>(ENDPOINTS.NOTIFICATIONS.PREFERENCES, authToken));

export const updateNotificationPreferencesServer = async (data: NotificationPreferenceUpdate, authToken: string) =>
  unwrap(await serverApiClient.patch<NotificationPreference>(ENDPOINTS.NOTIFICATIONS.PREFERENCES, data, authToken));
