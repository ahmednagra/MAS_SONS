import Link from 'next/link';

const COLUMNS = [
  { title: 'Catalog', links: [{ label: 'Vehicles', href: '/vehicles' }, { label: 'Heavy Equipment', href: '/equipment' }] },
  { title: 'Shipping', links: [{ label: 'Mombasa', href: '/destinations/KE' }, { label: 'Durban', href: '/destinations/ZA' }, { label: 'Jebel Ali', href: '/destinations/AE' }, { label: 'Karachi', href: '/destinations/PK' }] },
  { title: 'Company', links: [{ label: 'How It Works', href: '/how-it-works' }, { label: 'Verification', href: '/verification' }, { label: 'FAQ', href: '/faq' }, { label: 'Sell to Us (JP)', href: '/sell' }] },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <p className="text-lg font-bold tracking-tight text-ink">M.A.S &amp; SONS</p>
            <p className="mt-2 max-w-[15rem] text-sm text-sub">
              Family-run exporter of used vehicles and heavy machinery from Japan. 古物商許可 第401210001551.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sub">{col.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}><Link href={link.href} className="text-sm text-ink">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-line pt-5 text-xs text-sub">
          <span>© M.A.S &amp; SONS 株式会社</span>
          <span>Shimotsuma, Ibaraki, Japan</span>
        </div>
        <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-sub opacity-75">
          Representative photography for review only, not M.A.S &amp; SONS&rsquo; own stock — via Wikimedia
          Commons: Land Cruiser (Mr.choppers, CC BY-SA 4.0), HiAce (User3204, CC BY 4.0), Prius (M 93, CC
          BY-SA 3.0), Note (TTTNIS, CC0), excavator (Kallerna, CC BY-SA 4.0), tractor (Mulad, CC BY 2.0),
          loader (Wikideas1, CC0). Final site uses M.A.S &amp; SONS&rsquo; own inventory photos.
        </p>
      </div>
    </footer>
  );
}
