// src/lib/api-result.ts
// Uniform result envelope for every service call plus a typed error that carries status, code, and request id.

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly url?: string;

  constructor(message: string, opts: { status: number; code?: string; requestId?: string; url?: string; cause?: unknown }) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
    this.url = opts.url;
  }

  /** 0 means the request never reached the server (network refused, DNS, timeout). */
  get isNetwork(): boolean {
    return this.status === 0;
  }
}

export function unwrap<T>(result: ApiResult<T>): T {
  if (result.error || result.data === null) throw result.error ?? new ApiError('No response data', { status: result.status });
  return result.data;
}
