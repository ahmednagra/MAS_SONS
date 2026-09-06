import { StockTable } from '@/components/admin/StockTable';

// No SSR prefetch here on purpose: stockListOptions' queryFn goes through the browser-facing
// client service (relative URL via nextjsApiClient), which can't be resolved by Node's fetch
// server-side — attempting it here threw "Failed to parse URL from /api/v0/stock" and also
// tripped the Cache Components "uncached fetch outside Suspense" check. This is a small,
// internal, staff-only table; client-only fetch via StockTable's useStockList is simpler and
// correct, matching the guide's plain "Internal Staff Admin" pattern rather than its separate,
// optional SSR-prefetch one.
export default function AdminStockPage() {
  return <StockTable />;
}
