'use client';
import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/queries';

const noopSubscribe = () => () => {};

export function NotificationBell() {
  // Same hydration-safe guard as SavedSearchesList: the query's `enabled` depends on a
  // browser-only cookie, so its state differs between SSR and the first client render.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = mounted ? (data?.unread_count ?? 0) : 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-surface text-ink hover:bg-paper"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-semibold text-accent-ink">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-80 rounded-sm border border-line bg-surface p-2 shadow-lg sm:left-auto sm:right-0">
          <div className="flex items-center justify-between px-2 py-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-sub">Notifications</p>
            {!!data?.items.length && (
              <button type="button" onClick={() => markAllRead.mutate()} className="text-xs font-medium text-sub hover:text-ink">
                Mark all read
              </button>
            )}
          </div>
          {!data?.items.length ? (
            <p className="px-2 py-4 text-sm text-sub">No notifications yet.</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {data.items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => { if (n.status !== 'read') markRead.mutate(n.id); }}
                    className={`block w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-paper ${n.status !== 'read' ? 'bg-paper/70' : ''}`}
                  >
                    <p className="font-medium text-ink">{n.title}</p>
                    <p className="mt-0.5 text-xs text-sub">{n.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/account/notifications"
            onClick={() => setOpen(false)}
            className="mt-1 block px-2 py-1.5 text-center text-xs font-medium text-sub hover:text-ink"
          >
            Notification settings
          </Link>
        </div>
      )}
    </div>
  );
}
