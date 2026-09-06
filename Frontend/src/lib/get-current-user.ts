import 'server-only';
import { getAccessToken } from '@/lib/session';
import { getCurrentUserServer } from '@/services/auth';
import type { User } from '@/types/auth';

// 'use cache: private' is what makes reading cookies() here legal under Cache
// Components — the result stays in the browser, never cached on the server
// (docs/authentication-with-cache-components.md). Every caller must still sit
// behind a <Suspense> boundary; this directive alone doesn't satisfy that.
export async function getCurrentUser(): Promise<User | null> {
  'use cache: private';
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await getCurrentUserServer(token);
  } catch {
    return null;
  }
}
