'use client';
import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getStock, getStockList, updateStock } from '@/services/stock';
import type { StockSearchParams, UpdateUnitInput } from '@/types/stock';

export const stockListOptions = (params: StockSearchParams) =>
  queryOptions({
    queryKey: queryKeys.stock.list(params),
    queryFn: () => getStockList(params),
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export const useStockList = (params: StockSearchParams) => useQuery(stockListOptions(params));

export const unitOptions = (id: string) =>
  queryOptions({
    queryKey: queryKeys.stock.detail(id),
    queryFn: () => getStock(id),
    enabled: !!id,
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
  });

export const useUnit = (id: string) => useQuery(unitOptions(id));

export function useUpdateUnit(unitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUnitInput) => updateStock(unitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.stock.detail(unitId) }),
  });
}
