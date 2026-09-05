import { QueryClient, DefaultOptions } from '@tanstack/react-query';

export const STALE_TIMES = {
  STATIC: 30 * 60_000,
  SEMI_DYNAMIC: 5 * 60_000,
  DYNAMIC: 60_000,
  REALTIME: 0,
  INFINITE: Infinity,
} as const;

export const GC_TIMES = {
  SHORT: 5 * 60_000,
  MEDIUM: 30 * 60_000,
  LONG: 60 * 60_000,
  INFINITE: Infinity,
} as const;

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
    networkMode: 'online',
  },
  mutations: { retry: 1, networkMode: 'online' },
};

export const createQueryClient = () => new QueryClient({ defaultOptions });

let browserClient: QueryClient | undefined;
export function getQueryClient() {
  if (typeof window === 'undefined') return createQueryClient();
  return (browserClient ??= createQueryClient());
}
