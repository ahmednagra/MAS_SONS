import Link from 'next/link';
import { Brand } from '@/components/layout/Brand';
import { SITE, telHref, whatsappHref } from '@/config/site';
import type { Destination } from '@/types/destinations';

const BROWSE = [
  { label: 'All stock', href: '/stock' },
  { label: 'Vehicles', href: '/vehicles' },
  { label: 'Heavy equipment', href: '/equipment' },
  { label: 'Request sourcing', href: '/request' },
];
const COMPANY = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Shipping', href: '/shipping' },
  { label: 'Verification', href: '/verification' },
  { label: 'FAQ', href: '/faq' },
];

const MODE_LABEL: Record<string, string> = { roro: 'RoRo', container: 'Container', both: 'RoRo / container' };

export function Footer({ destinations = [] }: { destinations?: Destination[] }) {
  const proofs = [
    `Licensed secondhand dealer · ${SITE.license}`,
    `Exporting from ${SITE.originPorts.join(' and ')}`,
    'Auction inspection sheet on every unit',
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-[1200px] px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2.4fr)]">
          {/* Brand + the trust facts a buyer wiring money abroad actually checks. */}
          <div>
            <Brand variant="footer" />
            <p className="mt-4 max-w-[19rem] text-sm leading-relaxed text-sub">
              Family-run exporter of used vehicles and heavy machinery from Japan. One stock pool, one seller.
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-sm text-ink">
              {proofs.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden className="mt-1 flex-none"><path d="M5 13l4 4L19 7" /></svg>
                  <span className={p.startsWith('Licensed') ? 'font-mono text-[13px]' : ''}>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-8">
          <div className="grid gap-8 sm:grid-cols-3">
          <FooterList title="Browse" links={BROWSE} />
          <FooterList title="Company" links={COMPANY} />

          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-sub">Contact</h3>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-ink">
              {SITE.whatsapp && (
                <li>
                  <a href={whatsappHref(SITE.whatsapp, `Hello ${SITE.name}, I am interested in a vehicle.`)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
                    <Dot /> WhatsApp
                  </a>
                </li>
              )}
              {SITE.phone && <li><a href={telHref(SITE.phone)} className="inline-flex items-center gap-2 underline-offset-4 hover:underline"><Dot /> {SITE.phone}</a></li>}
              {SITE.email && <li><a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-2 underline-offset-4 hover:underline"><Dot /> {SITE.email}</a></li>}
              <li className="text-sub">{SITE.hours}</li>
              <li className="text-sub">{SITE.address}</li>
              <li className="pt-1">
                <Link href={SITE.jpSiteHref} className="font-medium underline-offset-4 hover:underline" lang="ja">車を売る · Sell to us (日本語)</Link>
              </li>
            </ul>
          </div>
          </div>

          {destinations.length > 0 && (
            <section aria-labelledby="footer-ports" className="border-t border-line pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 id="footer-ports" className="font-mono text-[11px] uppercase tracking-[0.16em] text-sub">We ship to</h3>
                <p className="text-[11px] text-sub">Typical sailing days from Japan · C&amp;F quoted per port</p>
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                {destinations.map((d) => (
                  <li key={d.country_code}>
                    <Link
                      href={`/destinations/${d.country_code}`}
                      title={d.shipping_mode ? `${d.country_name} · ${MODE_LABEL[d.shipping_mode]}` : d.country_name}
                      className="inline-flex items-baseline gap-1.5 rounded-sm border border-line bg-paper px-2.5 py-1 text-[13px] text-ink transition-colors hover:border-accent hover:text-accent"
                    >
                      <span className="font-medium">{d.primary_port}</span>
                      <span className="text-sub">{d.country_code}</span>
                      {d.estimated_transit_days != null && (
                        <span className="font-mono text-[10.5px] tabular-nums text-sub">{d.estimated_transit_days}d</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-5 text-xs text-sub">
          <span>© {SITE.legalName}</span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/privacy" className="underline-offset-4 hover:text-ink hover:underline">Privacy</Link>
            <Link href="/terms" className="underline-offset-4 hover:text-ink hover:underline">Terms</Link>
            <span aria-hidden>·</span>
            <Link href="/" className="text-ink" aria-current="page">English</Link>
            <Link href={SITE.jpSiteHref} lang="ja" className="underline-offset-4 hover:text-ink hover:underline">日本語</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-sub">{title}</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}><Link href={link.href} className="text-sm text-ink underline-offset-4 hover:underline">{link.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

function Dot() {
  return <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />;
}
