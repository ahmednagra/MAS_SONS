'use server';
import { redirect } from 'next/navigation';
import { logoutServer } from '@/services/auth';
import { clearSessionCookies, getRefreshToken } from '@/lib/session';

export async function logout() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await logoutServer(refreshToken);
    } catch {
      // The token may already be expired/revoked — clearing the local session still succeeds.
    }
  }
  await clearSessionCookies();
  redirect('/');
}
