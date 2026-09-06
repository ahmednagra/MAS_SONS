'use client';
import { useQuery } from '@tanstack/react-query';
import { stockFacetsOptions, stockListOptions } from './stock-options';
import type { StockFacets, StockSearchParams } from '@/types/stock';

export const useStockList = (params: StockSearchParams) => useQuery(stockListOptions(params));

export const useStockFacets = (params: StockSearchParams, initialData?: StockFacets) =>
  useQuery(stockFacetsOptions(params, initialData));
