'use client';
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { useSessionKey } from './useSessionKey';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/notifications';
import type { Notification, NotificationListResponse } from '@/types/notifications';

const notificationsOptions = (sessionKey: string) =>
  queryOptions({
    queryKey: queryKeys.notifications.list(sessionKey),
    queryFn: () => getNotifications({ limit: 10 }),
    enabled: sessionKey !== 'guest',
    staleTime: STALE_TIMES.DYNAMIC, // a buyer checking status wants this fresh
    gcTime: GC_TIMES.MEDIUM,
  });

export function useNotifications() {
  return useQuery(notificationsOptions(useSessionKey()));
}

interface MarkReadContext {
  previous: NotificationListResponse | undefined;
}

export function useMarkNotificationRead() {
  const sessionKey = useSessionKey();
  const qc = useQueryClient();
  const key = queryKeys.notifications.list(sessionKey);

  return useMutation<Notification, Error, number, MarkReadContext>({
    mutationFn: (id) => markNotificationRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<NotificationListResponse>(key);
      qc.setQueryData<NotificationListResponse>(key, (old) =>
        old && {
          ...old,
          items: old.items.map((n) => (n.id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n)),
          unread_count: Math.max(0, old.unread_count - (old.items.find((n) => n.id === id && n.status !== 'read') ? 1 : 0)),
        },
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => ctx?.previous && qc.setQueryData(key, ctx.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useMarkAllNotificationsRead() {
  const sessionKey = useSessionKey();
  const qc = useQueryClient();
  const key = queryKeys.notifications.list(sessionKey);

  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.setQueryData<NotificationListResponse>(key, (old) =>
        old && { ...old, items: old.items.map((n) => ({ ...n, status: 'read', read_at: n.read_at ?? new Date().toISOString() })), unread_count: 0 },
      );
    },
  });
}
