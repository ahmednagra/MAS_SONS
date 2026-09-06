// src/lib/server-api.ts
// Server-side FastAPI client: bounded timeout, request-id correlation, and one explanatory log line per failure.
import { env } from '@/lib/env';
import { ApiError, type ApiResult } from '@/lib/api-result';
import { logger } from '@/lib/logger';

const log = logger.scope('fastapi');
const REQUEST_TIMEOUT_MS = 15_000;
const REQUEST_ID_HEADER = 'X-Request-ID';

function requestId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Turn a low-level fetch failure into the one sentence a developer needs to act on. */
function explainNetworkFailure(error: unknown, baseUrl: string): string {
  const cause = (error as { cause?: { code?: string } })?.cause;
  const code = cause?.code ?? (error as { name?: string })?.name;
  switch (code) {
    case 'ECONNREFUSED':
      return `FastAPI is not listening at ${baseUrl}. Start it with: cd Backend && python -m uvicorn main:app --reload --port 8000`;
    case 'ENOTFOUND':
    case 'EAI_AGAIN':
      return `Host in API_BASE_URL (${baseUrl}) does not resolve. Check Frontend/.env.local.`;
    case 'TimeoutError':
    case 'AbortError':
      return `FastAPI did not answer within ${REQUEST_TIMEOUT_MS / 1000}s at ${baseUrl}. It may be reloading or blocked on the database.`;
    case 'ECONNRESET':
      return `Connection to ${baseUrl} was reset mid-request (server restarted?).`;
    default:
      return `Request to ${baseUrl} failed: ${code ?? 'unknown network error'}.`;
  }
}

class ServerApiClient {
  constructor(private baseUrl = `${env.API_BASE_URL}/api/v0`) {}

  private async request<T>(endpoint: string, options: RequestInit & { authToken?: string | null } = {}): Promise<ApiResult<T>> {
    const { authToken, ...rest } = options;
    const method = rest.method ?? 'GET';
    const url = `${this.baseUrl}${endpoint}`;
    const id = requestId();
    const headers = new Headers(rest.headers);
    headers.set('Content-Type', 'application/json');
    headers.set(REQUEST_ID_HEADER, id);
    if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(url, { ...rest, headers, signal: rest.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (error) {
      const hint = explainNetworkFailure(error, env.API_BASE_URL || '(API_BASE_URL unset)');
      log.error(`${method} ${endpoint} unreachable after ${Date.now() - started}ms — ${hint}`, { requestId: id, error });
      return { data: null, error: new ApiError(hint, { status: 0, code: 'NETWORK', requestId: id, url, cause: error }), status: 0 };
    }

    const body = await res.json().catch(() => null);
    const ms = Date.now() - started;
    if (res.ok) {
      log.debug(`${method} ${endpoint} -> ${res.status} in ${ms}ms`, { requestId: id });
      return { data: body as T, error: null, status: res.status };
    }

    const detail = typeof body?.detail === 'string' ? body.detail : body?.error ?? res.statusText;
    const message = Array.isArray(body?.detail)
      ? `Validation failed: ${body.detail.map((e: { loc?: unknown[]; msg?: string }) => `${(e.loc ?? []).join('.')}: ${e.msg}`).join('; ')}`
      : String(detail);
    const level = res.status === 404 ? 'debug' : res.status >= 500 ? 'error' : 'warn';
    log[level](`${method} ${endpoint} -> ${res.status} in ${ms}ms: ${message}`, { requestId: id, backendRequestId: res.headers.get(REQUEST_ID_HEADER) });
    return {
      data: null,
      error: new ApiError(message, { status: res.status, code: body?.error_code, requestId: res.headers.get(REQUEST_ID_HEADER) ?? id, url }),
      status: res.status,
    };
  }

  get<T>(endpoint: string, authToken?: string | null) {
    return this.request<T>(endpoint, { method: 'GET', authToken });
  }
  post<T>(endpoint: string, data: unknown, authToken?: string | null) {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data), authToken });
  }
  patch<T>(endpoint: string, data: unknown, authToken: string) {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), authToken });
  }
  put<T>(endpoint: string, data: unknown, authToken: string) {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data), authToken });
  }
  delete<T>(endpoint: string, authToken: string) {
    return this.request<T>(endpoint, { method: 'DELETE', authToken });
  }
}

export const serverApiClient = new ServerApiClient();
