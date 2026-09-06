import { env } from '@/lib/env';
import { ApiError } from '@/lib/api-result';
import { logger } from '@/lib/logger';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { UploadResponse } from '@/types/uploads';

const log = logger.scope('uploads');

// FastAPI's /uploads endpoint takes multipart/form-data — the shared serverApiClient always
// sends JSON, so this bypasses it with its own fetch rather than complicating that client for
// one endpoint (docs/API Flow Structure Guide — the exception is narrow enough to keep local).
export async function uploadFileServer(purpose: string, file: File, authToken?: string | null): Promise<UploadResponse> {
  const form = new FormData();
  form.set('purpose', purpose);
  form.set('file', file);

  const headers = new Headers();
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`);

  let res: Response;
  try {
    res = await fetch(`${env.API_BASE_URL}/api/v0${ENDPOINTS.UPLOADS.CREATE}`, { method: 'POST', body: form, headers });
  } catch (error) {
    log.error('POST /uploads unreachable', { error });
    throw new ApiError('Could not reach the upload service — please try again.', { status: 0, code: 'NETWORK' });
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = typeof body?.detail === 'string' ? body.detail : body?.error ?? res.statusText;
    log.warn(`POST /uploads -> ${res.status}: ${message}`);
    throw new ApiError(String(message), { status: res.status, code: body?.error_code });
  }
  return body as UploadResponse;
}
