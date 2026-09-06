import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { CSRF_COOKIE_NAME } from '@/lib/csrf';
import type { TokenResponse } from '@/types/auth';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // matches backend REFRESH_TOKEN_EXPIRE_DAYS default
const isProd = process.env.NODE_ENV === 'production';

const baseCookieOptions = { secure: isProd, sameSite: 'lax' as const, path: '/' };

function sessionCookieSpecs(tokens: TokenResponse) {
  return [
    { name: ACCESS_TOKEN_COOKIE, value: tokens.access_token, options: { ...baseCookieOptions, httpOnly: true, maxAge: tokens.expires_in } },
    { name: REFRESH_TOKEN_COOKIE, value: tokens.refresh_token, options: { ...baseCookieOptions, httpOnly: true, maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS } },
    { name: CSRF_COOKIE_NAME, value: randomBytes(24).toString('hex'), options: { ...baseCookieOptions, httpOnly: false, maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS } },
  ];
}

// Server Actions / Server Components mutate the current request's cookie jar directly.
export async function applySessionCookies(tokens: TokenResponse) {
  const store = await cookies();
  for (const { name, value, options } of sessionCookieSpecs(tokens)) store.set(name, value, options);
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(CSRF_COOKIE_NAME);
}

// Route Handlers building a distinct NextResponse (e.g. a redirect) must set cookies on
// that response object — next/headers' cookies() does not reliably attach to it.
export function applySessionCookiesToResponse(response: NextResponse, tokens: TokenResponse) {
  for (const { name, value, options } of sessionCookieSpecs(tokens)) response.cookies.set(name, value, options);
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}
