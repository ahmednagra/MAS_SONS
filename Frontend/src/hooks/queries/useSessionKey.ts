'use client';
import { getCsrfToken } from '@/lib/csrf';

// Identity comes from an httpOnly cookie the browser can't read, so account-scoped query
// keys can't use a real user id client-side. The CSRF cookie is regenerated on every login
// and cleared on logout (lib/session.ts), which gives the same cache-isolation property
// without a "who am I" round trip: switching accounts in one tab can't show the previous
// account's data before the affected queries refetch. Shared by every account-surface hook
// (favorites, saved searches, orders, notifications) that needs to key its cache per session.
export function useSessionKey(): string {
  return getCsrfToken() ?? 'guest';
}
