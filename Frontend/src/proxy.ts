import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import type { TokenResponse } from '@/types/auth';

// Cookie names duplicated from lib/session.ts deliberately — the proxy runs on the Edge runtime
// and must not import next/headers or any Node-only module (e.g. crypto).
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // matches backend REFRESH_TOKEN_EXPIRE_DAYS default

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = { secure: isProd, sameSite: 'lax' as const, path: '/', httpOnly: true };

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// UX-level redirect only — real authorization is FastAPI's require_staff/get_current_user
// dependencies, which this never substitutes for.
//
// The access_token cookie is short-lived (30 min, expired client-side by the browser itself)
// while refresh_token lives for 30 days — without the refresh step below, a still-logged-in
// user hitting an /account or /admin page got silently bounced to /login every 30 minutes
// despite holding a valid refresh token. This refreshes the session transparently and forwards
// the new access token to the current request (via request.cookies) so Server Components/Route
// Handlers downstream see it immediately, not just on the next navigation.
export async function proxy(request: NextRequest) {
  if (request.cookies.has(ACCESS_TOKEN_COOKIE)) return NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) return redirectToLogin(request);

  try {
    const res = await fetch(`${env.API_BASE_URL}/api/v0/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
    const tokens: TokenResponse = await res.json();

    request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token);
    const response = NextResponse.next({ request });
    response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, { ...cookieOptions, maxAge: tokens.expires_in });
    response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, { ...cookieOptions, maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS });
    return response;
  } catch {
    // Refresh token expired/revoked — fall through as logged out.
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
