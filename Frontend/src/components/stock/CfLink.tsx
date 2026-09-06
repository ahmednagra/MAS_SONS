'use client';
import Link from 'next/link';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';
import type { UnitSummary } from '@/types/stock';

/**
 * The card's action. Before a destination is chosen it reads "Get quote"; once the buyer
 * picks a port (utility bar) every card offers a C&F quote to that exact port, and the
 * request form arrives pre-filled. Freight is quoted, never estimated here.
 */
export function CfLink({ unit, destinations }: { unit: UnitSummary; destinations: Destination[] }) {
  const [code] = useDestinationPreference();
  const destination = code ? destinations.find((d) => d.country_code === code) : undefined;

  const params = new URLSearchParams({
    make: unit.make,
    model: `${unit.year} ${unit.model}`,
    unit: unit.slug,
  });
  if (destination) params.set('destination', destination.country_code);

  return (
    <Link
      href={`/request?${params.toString()}`}
      onClick={(e) => e.stopPropagation()}
      className="text-xs font-medium text-sub underline-offset-4 transition-colors hover:text-accent hover:underline"
    >
      {destination ? `C&F to ${destination.primary_port}` : 'Get quote'}<span aria-hidden className="ml-1 opacity-0 transition-opacity group-hover:opacity-100">→</span>
    </Link>
  );
}
