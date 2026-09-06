// src/lib/nextjs-api.ts
// Browser client for the Next.js /api/v0 routes: CSRF header on writes, typed errors, one warn line per failure.
import { isUnsafeMethod, getCsrfToken, CSRF_HEADER_NAME } from '@/lib/csrf';
import { ApiError, type ApiResult } from '@/lib/api-result';
import { logger } from '@/lib/logger';

const log = logger.scope('api');

class NextJSApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const method = options.method ?? 'GET';
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
    if (isUnsafeMethod(method)) {
      const csrf = getCsrfToken();
      if (csrf) headers.set(CSRF_HEADER_NAME, csrf);
    }

    let res: Response;
    try {
      res = await fetch(endpoint, { credentials: 'include', ...options, headers });
    } catch (error) {
      log.warn(`${method} ${endpoint} failed before reaching the server (offline?)`, { error });
      return { data: null, error: new ApiError('Network error — check your connection', { status: 0, code: 'NETWORK', url: endpoint, cause: error }), status: 0 };
    }

    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (res.ok) return { data: body as T, error: null, status: res.status };

    const message: string = body?.error ?? (typeof body?.detail === 'string' ? body.detail : res.statusText);
    const error = new ApiError(message, { status: res.status, code: body?.error_code, requestId: body?.request_id, url: endpoint });
    (res.status >= 500 ? log.error : log.warn)(`${method} ${endpoint} -> ${res.status}: ${message}`, { code: error.code, requestId: error.requestId });
    return { data: null, error, status: res.status };
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }
  post<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) });
  }
  patch<T>(endpoint: string, data?: unknown, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) });
  }
  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const nextjsApiClient = new NextJSApiClient();
