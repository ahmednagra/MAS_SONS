export function toQueryString(params: object): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params as Record<string, unknown>)) {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
  }
  return search.size ? `?${search}` : '';
}
