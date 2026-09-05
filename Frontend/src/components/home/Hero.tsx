import Image from 'next/image';

const STRIP = [
  { src: '/mock/prado.jpg', alt: 'Toyota Land Cruiser Prado-class SUV' },
  { src: '/mock/hiace.jpg', alt: 'Toyota HiAce van' },
  { src: '/mock/prius.jpg', alt: 'Toyota Prius sedan' },
  { src: '/mock/excavator.jpg', alt: 'Hydraulic excavator' },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:py-20">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-sub">
        Used vehicles &amp; heavy equipment · exported from Japan
      </p>
      <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl">
        Find it in Japan. Ship it anywhere.
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-sub sm:text-lg">
        Auction-graded vehicles and machinery, exported directly from Yokohama and Nagoya with the
        inspector&rsquo;s own sheet, full documentation and an FOB, C&amp;F or CIF quote to your port.
      </p>

      <form
        action="/stock"
        method="get"
        className="mx-auto mt-8 grid max-w-3xl grid-cols-1 overflow-hidden rounded-sm border border-line bg-surface text-left sm:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <label className="border-b border-line p-3 sm:border-b-0 sm:border-r">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-sub">Category</span>
          <select name="category" className="mt-1 w-full bg-transparent text-sm font-medium text-ink focus-visible:outline-none">
            <option value="">All categories</option>
            <option value="vehicle">Vehicles</option>
            <option value="equipment">Heavy Equipment</option>
          </select>
        </label>
        <label className="border-b border-line p-3 sm:border-b-0 sm:border-r">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-sub">Destination port</span>
          <select name="shippableTo" className="mt-1 w-full bg-transparent text-sm font-medium text-ink focus-visible:outline-none">
            <option value="">Any port</option>
            <option value="KE">Mombasa, Kenya</option>
            <option value="ZA">Durban, South Africa</option>
            <option value="AE">Jebel Ali, UAE</option>
            <option value="PK">Karachi, Pakistan</option>
          </select>
        </label>
        <label className="p-3">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-sub">Budget (USD)</span>
          <input
            name="priceMax"
            type="number"
            placeholder="Up to $30,000"
            className="mt-1 w-full bg-transparent text-sm font-medium text-ink placeholder:text-sub focus-visible:outline-none"
          />
        </label>
        <button type="submit" className="bg-accent px-6 py-4 text-sm font-semibold text-accent-ink hover:opacity-90">
          Search stock
        </button>
      </form>

      <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
        {STRIP.map((photo) => (
          <div key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
