import { NextRequest } from 'next/server';

const ACCESS_TOKEN_COOKIE = 'access_token';
const PLACEHOLDER_BEARERS = new Set(['', 'null', 'undefined', 'cookie-session']);

export function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7).trim();
    if (token && !PLACEHOLDER_BEARERS.has(token.toLowerCase())) return token;
  }
  return request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null;
}
