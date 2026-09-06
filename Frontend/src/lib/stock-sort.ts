// src/lib/stock-sort.ts
// Sort keys for /stock, shared by the server page and the client toolbar (no 'use client' here).
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest arrivals' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'year_desc', label: 'Year: newest first' },
  { value: 'mileage_asc', label: 'Mileage: lowest first' },
  { value: 'grade_desc', label: 'Grade: best first' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

export const isSortKey = (v: unknown): v is SortKey => SORT_OPTIONS.some((o) => o.value === v);
