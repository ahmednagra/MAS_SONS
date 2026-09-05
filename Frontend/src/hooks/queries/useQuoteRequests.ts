'use client';
import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getQuoteRequests, submitQuoteRequest } from '@/services/quote-requests';

export const quoteRequestsOptions = (userId: string) =>
  queryOptions({
    queryKey: queryKeys.quoteRequests.list(userId),
    queryFn: () => getQuoteRequests(userId),
    enabled: !!userId,
    staleTime: STALE_TIMES.DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export const useQuoteRequests = (userId: string) => useQuery(quoteRequestsOptions(userId));

export function useSubmitQuoteRequest(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitQuoteRequest,
    onSuccess: () => userId && qc.invalidateQueries({ queryKey: queryKeys.quoteRequests.list(userId) }),
  });
}
