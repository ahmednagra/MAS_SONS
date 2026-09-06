import { nextjsApiClient } from '@/lib/nextjs-api';
import { unwrap } from '@/lib/api-result';
import { toQueryString } from '@/lib/query-string';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { Notification, NotificationListResponse } from '@/types/notifications';

export const getNotifications = async (params: { cursor?: number; limit?: number } = {}) =>
  unwrap(await nextjsApiClient.get<NotificationListResponse>(`/api/v0${ENDPOINTS.NOTIFICATIONS.LIST}${toQueryString(params)}`));

export const markNotificationRead = async (id: number) =>
  unwrap(await nextjsApiClient.post<Notification>(`/api/v0${ENDPOINTS.NOTIFICATIONS.MARK_READ(String(id))}`));

export const markAllNotificationsRead = async () =>
  unwrap(await nextjsApiClient.post<{ message: string }>(`/api/v0${ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`));
