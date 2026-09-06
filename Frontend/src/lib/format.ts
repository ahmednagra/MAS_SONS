export const formatUsd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

export const formatInt = (n: number) => n.toLocaleString('en-US');

export const formatUsage = (n: number | null | undefined, unit: 'km' | 'hrs') =>
  n == null ? '—' : `${formatInt(n)} ${unit}`;

export const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|\s|-)\S/g, (c) => c.toUpperCase());
