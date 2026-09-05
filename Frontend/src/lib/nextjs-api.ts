import { isUnsafeMethod, getCsrfToken, CSRF_HEADER_NAME } from '@/lib/csrf';
import type { ApiResult } from '@/lib/api-result';

class NextJSApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (isUnsafeMethod(options.method)) {
      const csrf = getCsrfToken();
      if (csrf) headers.set(CSRF_HEADER_NAME, csrf);
    }

    const res = await fetch(endpoint, { credentials: 'include', ...options, headers });
    const body = res.status === 204 ? null : await res.json().catch(() => null);

    return {
      data: res.ok ? (body as T) : null,
      error: res.ok ? null : new Error(body?.error ?? res.statusText),
      status: res.status,
    };
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
