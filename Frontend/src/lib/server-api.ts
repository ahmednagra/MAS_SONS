import { env } from '@/lib/env';
import type { ApiResult } from '@/lib/api-result';

class ServerApiClient {
  constructor(private baseUrl = env.API_BASE_URL) {}

  private async request<T>(endpoint: string, options: RequestInit & { authToken?: string | null } = {}): Promise<ApiResult<T>> {
    const { authToken, ...rest } = options;
    const headers = new Headers(rest.headers);
    headers.set('Content-Type', 'application/json');
    if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

    const res = await fetch(`${this.baseUrl}${endpoint}`, { ...rest, headers });
    const body = await res.json().catch(() => null);

    return { data: res.ok ? (body as T) : null, error: res.ok ? null : new Error(body?.error ?? res.statusText), status: res.status };
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
}

export const serverApiClient = new ServerApiClient();
