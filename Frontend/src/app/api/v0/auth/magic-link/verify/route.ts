import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkServer } from '@/services/auth';
import { applySessionCookiesToResponse } from '@/lib/session';

// GET, not a Server Action, because this is reached by a plain email-link click —
// a redirect that also needs to set cookies is exactly what a Route Handler is for.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));

  try {
    const tokens = await verifyMagicLinkServer({ token });
    const response = NextResponse.redirect(new URL('/account', request.url));
    applySessionCookiesToResponse(response, tokens);
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
  }
}
