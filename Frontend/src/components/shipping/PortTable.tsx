'use client';
import Link from 'next/link';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';

const MODE_LABEL: Record<string, string> = { roro: 'RoRo', container: 'Container', both: 'RoRo or container' };

/** Every port we ship to, with the chosen one highlighted and a quote link per row. */
export function PortTable({ destinations }: { destinations: Destination[] }) {
  const [code] = useDestinationPreference();
  if (!destinations.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
            <th scope="col" className="py-2.5 pr-4 font-semibold">Destination port</th>
            <th scope="col" className="py-2.5 pr-4 font-semibold">Country</th>
            <th scope="col" className="py-2.5 pr-4 font-semibold">From</th>
            <th scope="col" className="py-2.5 pr-4 font-semibold">Method</th>
            <th scope="col" className="py-2.5 pr-4 text-right font-semibold">Typical days</th>
            <th scope="col" className="py-2.5 text-right font-semibold"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {destinations.map((d) => {
            const chosen = d.country_code === code;
            return (
              <tr key={d.country_code} className={`border-b border-line ${chosen ? 'bg-accent/5' : ''}`}>
                <td className="py-3 pr-4 font-medium text-ink">
                  <Link href={`/destinations/${d.country_code}`} className="underline-offset-4 hover:underline">{d.primary_port}</Link>
                  {chosen && <span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-ink">your port</span>}
                </td>
                <td className="py-3 pr-4 text-sub">{d.country_name}</td>
                <td className="py-3 pr-4 text-sub">{d.origin_port}</td>
                <td className="py-3 pr-4 text-sub">{d.shipping_mode ? MODE_LABEL[d.shipping_mode] : '—'}</td>
                <td className="py-3 pr-4 text-right font-mono tabular-nums text-ink">{d.estimated_transit_days != null ? `≈${d.estimated_transit_days}` : '—'}</td>
                <td className="py-3 text-right">
                  <Link href={`/request?destination=${d.country_code}`} className="whitespace-nowrap text-xs font-medium text-accent underline-offset-4 hover:underline">C&amp;F quote →</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
