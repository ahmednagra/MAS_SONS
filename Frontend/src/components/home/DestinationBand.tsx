import Link from 'next/link';
import { SectionHeader } from '@/components/layout/SectionHeader';
import type { Destination } from '@/types/destinations';

const MODE_LABEL: Record<string, string> = { roro: 'RoRo', container: 'Container', both: 'RoRo or container' };

/** Ports as a clean table — no decorative map. Transit is a sailing band, stated as such. */
export function DestinationBand({ destinations }: { destinations: Destination[] }) {
  if (!destinations.length) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20">
      <SectionHeader
        eyebrow="Where we ship"
        title="From Yokohama and Nagoya to your port"
        description="Transit times are indicative sailing bands, not a booking. Your quote states the actual vessel and schedule."
        aside={<Link href="/shipping" className="underline-offset-4 hover:underline">Shipping guide →</Link>}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
              <th scope="col" className="py-2.5 pr-4 font-semibold">Destination port</th>
              <th scope="col" className="py-2.5 pr-4 font-semibold">Country</th>
              <th scope="col" className="py-2.5 pr-4 font-semibold">From</th>
              <th scope="col" className="py-2.5 pr-4 font-semibold">Method</th>
              <th scope="col" className="py-2.5 text-right font-semibold">Transit</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.country_code} className="border-b border-line transition-colors hover:bg-paper">
                <td className="py-3.5 pr-4 font-medium text-ink">
                  <Link href={`/destinations/${d.country_code}`} className="underline-offset-4 hover:underline">{d.primary_port}</Link>
                </td>
                <td className="py-3.5 pr-4 text-sub">{d.country_name}</td>
                <td className="py-3.5 pr-4 font-mono text-[13px] text-sub">{d.origin_port}</td>
                <td className="py-3.5 pr-4 text-sub">{MODE_LABEL[d.shipping_mode ?? ''] ?? 'On request'}</td>
                <td className="py-3.5 text-right font-mono text-[13px] tabular-nums text-ink">
                  {d.estimated_transit_days != null ? `~${d.estimated_transit_days} days` : 'On request'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-sub">
        Your port not listed?{' '}
        <Link href="/request" className="font-medium text-ink underline-offset-4 hover:underline">Ask us →</Link>
      </p>
    </section>
  );
}
