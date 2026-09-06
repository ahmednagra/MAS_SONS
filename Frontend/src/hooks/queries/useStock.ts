'use client';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getStockList } from '@/services/stock';
import type { StockSearchParams } from '@/types/stock';

export const stockListOptions = (params: StockSearchParams) =>
  queryOptions({
    queryKey: queryKeys.stock.list(params),
    queryFn: () => getStockList(params),
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export const useStockList = (params: StockSearchParams) => useQuery(stockListOptions(params));
