import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/get-current-user';
import { getAccessToken } from '@/lib/session';
import { getOrderServer } from '@/services/orders';
import { getUnitsByIdsServer } from '@/services/stock/stock.server';
import { OrderFulfillmentForm } from '@/components/account/OrderFulfillmentForm';

export const metadata: Metadata = { title: 'Order details — M.A.S & SONS' };

// Reads the session cookie AND the dynamic route param, so both stay out of the page's
// top level and behind Suspense — params is itself a request-time API under Cache
// Components, same as cookies() (docs/authentication-with-cache-components.md's "push
// dynamic access down").
async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/account/orders/${id}`);

  const token = await getAccessToken();
  const order = await getOrderServer(id, token!);
  if (!order) notFound();

  const [unit] = await getUnitsByIdsServer([order.unit_id]);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {unit ? `${unit.year} ${unit.make} ${unit.model}` : `Order #${order.id}`}
      </h1>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Price</dt>
          <dd className="text-ink">${order.final_price_usd.toLocaleString('en-US')}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Incoterm</dt>
          <dd className="text-ink">{order.incoterm}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Destination</dt>
          <dd className="text-ink">{order.destination_country}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Payment</dt>
          <dd className="text-ink">{order.payment_status}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Shipping</dt>
          <dd className="text-ink">{order.shipping_status}</dd>
        </div>
        {order.invoice_number && (
          <div>
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-sub">Invoice</dt>
            <dd className="text-ink">{order.invoice_number}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 border-t border-line pt-6">
        <h2 className="font-display text-lg text-ink">Shipping details</h2>
        <p className="mt-1 text-sm text-sub">
          Tell us where and to whom this unit should ship. Identity verification for customs is handled separately by our team.
        </p>
        <OrderFulfillmentForm orderId={order.id} />
      </div>

      {order.quote_request_id && (
        <div className="mt-8 border-t border-line pt-6">
          <Link href={`/account/reviews/new?quote_request_id=${order.quote_request_id}`} className="text-sm font-medium text-ink underline-offset-4 hover:underline">
            Leave a review for this purchase →
          </Link>
        </div>
      )}
    </>
  );
}

function OrderSkeleton() {
  return <div className="h-64 animate-pulse rounded-sm bg-surface" />;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<OrderSkeleton />}>
      <OrderContent params={params} />
    </Suspense>
  );
}
