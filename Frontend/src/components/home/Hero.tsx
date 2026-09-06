import type { StockFacets } from '@/types/stock';

const FACTS = [
  'Real auction sheet on every unit',
  'FOB, C&F or CIF to your port',
  'No account needed for a quote',
];

const seg = 'flex min-w-0 flex-1 flex-col px-5 py-3 sm:py-2.5';
const segLabel = 'font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-sub';
const segField = 'mt-1 w-full truncate bg-transparent text-[15px] font-medium text-ink placeholder:font-normal placeholder:text-sub focus-visible:outline-none';

/**
 * Light, centred hero: one promise, three facts, one search bar. A plain GET form so it
 * works before hydration and every search is a shareable /stock URL. The full filter
 * panel lives on the stock page.
 */
export function Hero({ facets }: { facets: StockFacets }) {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-[1200px] px-4 pb-12 pt-16 text-center sm:pb-14 sm:pt-24">
        <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-sub">
          Used vehicles &amp; heavy equipment · exported from Japan
        </p>
        <h1 className="font-display mx-auto max-w-3xl text-[2.6rem] leading-[1.02] text-ink sm:text-[3.6rem]">Find your next vehicle in Japan</h1>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm text-sub">
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-none stroke-[#2f9e5b]" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8" />
                <path d="m6.5 10 2.3 2.3L13.5 7.6" />
              </svg>
              {fact}
            </li>
          ))}
        </ul>

        <form
          action="/stock"
          method="get"
          role="search"
          className="mx-auto mt-9 flex max-w-[940px] flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-[0_10px_40px_-18px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:rounded-full sm:pr-2"
        >
          <label className={`${seg} border-b border-line sm:border-b-0 sm:border-r`}>
            <span className={segLabel}>Category</span>
            <select suppressHydrationWarning name="category" className={segField} defaultValue="">
              <option value="">All ({facets.total.toLocaleString('en-US')})</option>
              <option value="vehicle">Vehicles ({facets.vehicles.toLocaleString('en-US')})</option>
              <option value="equipment">Heavy equipment ({facets.equipment.toLocaleString('en-US')})</option>
            </select>
          </label>
          <label className={`${seg} border-b border-line sm:border-b-0 sm:border-r`}>
            <span className={segLabel}>Make</span>
            <select suppressHydrationWarning name="make" className={segField} defaultValue="">
              <option value="">Any make</option>
              {facets.makes.map((m) => (
                <option key={m.value} value={m.value}>{m.value} ({m.count})</option>
              ))}
            </select>
          </label>
          <label className={`${seg} border-b border-line sm:border-b-0`}>
            <span className={segLabel}>Max budget (USD)</span>
            <input suppressHydrationWarning name="price_max" type="number" min={0} step={500} placeholder="Any budget" className={segField} />
          </label>
          <div className="p-2 sm:p-0">
            <button
              type="submit"
              aria-label="Search stock"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-paper hover:opacity-90 sm:h-12 sm:w-12 sm:rounded-full"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4.5 w-4.5 h-[18px] w-[18px] fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.2-4.2" />
              </svg>
              <span className="sm:hidden">Search stock</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
