import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { getAccessToken } from '@/lib/session';
import { getOrdersServer } from '@/services/orders';
import { getUnitsByIdsServer } from '@/services/stock/stock.server';

export const metadata: Metadata = { title: 'Your orders — M.A.S & SONS' };

// Reads the session cookie, so it stays out of the page's top level and behind
// Suspense (docs/authentication-with-cache-components.md), matching account/page.tsx.
async function OrdersContent() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account/orders');

  const token = await getAccessToken();
  const orders = await getOrdersServer(token!, { limit: 24 });
  if (!orders.length) {
    return <p className="mt-4 text-sm text-sub">No orders yet — orders appear here once a quote or sourcing request is converted.</p>;
  }

  const units = await getUnitsByIdsServer(orders.map((o) => o.unit_id));
  const unitById = new Map(units.map((u) => [u.id, u]));

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {orders.map((order) => {
        const unit = unitById.get(order.unit_id);
        return (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-sm border border-line bg-surface p-4 hover:border-ink"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink">{unit ? `${unit.year} ${unit.make} ${unit.model}` : `Order #${order.id}`}</p>
                <p className="mt-0.5 font-mono text-[11px] text-sub">
                  ${order.final_price_usd.toLocaleString('en-US')} · {order.incoterm} · {order.destination_country}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-medium text-ink">{order.shipping_status}</p>
                <p className="mt-0.5 font-mono text-[10.5px] text-sub">{order.payment_status}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function OrdersSkeleton() {
  return <div className="mt-6 h-40 animate-pulse rounded-sm bg-surface" />;
}

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Orders</h1>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
