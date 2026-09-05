export interface ApiResult<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

export function unwrap<T>(result: ApiResult<T>): T {
  if (result.error || result.data === null) throw result.error ?? new Error('No response data');
  return result.data;
}
