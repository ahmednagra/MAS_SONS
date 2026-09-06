'use client';
import { useDestinationPreference } from '@/lib/destination-preference';
import type { Destination } from '@/types/destinations';

export const SHIP_TO_PICKER_ID = 'ship-to-picker';

export function DestinationPicker({ destinations, className = '', id = SHIP_TO_PICKER_ID }: { destinations: Destination[]; className?: string; id?: string }) {
  const [code, setCode] = useDestinationPreference();
  if (!destinations.length) return null;

  return (
    <label className={`flex items-center gap-1.5 text-xs text-sub ${className}`}>
      <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
      <span className="hidden sm:inline">Ship to</span>
      <select suppressHydrationWarning
        id={id}
        aria-label="Destination port"
        value={code ?? ''}
        onChange={(e) => setCode(e.target.value || null)}
        className="max-w-[11rem] truncate bg-transparent text-xs font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <option value="">Choose port…</option>
        {destinations.map((d) => (
          <option key={d.country_code} value={d.country_code}>
            {d.primary_port}, {d.country_name}
          </option>
        ))}
      </select>
    </label>
  );
}
