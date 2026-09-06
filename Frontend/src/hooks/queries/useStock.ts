'use client';
import { useQuery } from '@tanstack/react-query';
import { stockListOptions } from './stock-options';
import type { StockSearchParams } from '@/types/stock';

export const useStockList = (params: StockSearchParams) => useQuery(stockListOptions(params));
