# Rendering, Caching & SEO Guide (Next.js 16)

Governs the public surface of an export platform: stock browse/search, unit detail pages, the
sitemap. Verified against the Next.js 16.3 docs (Sept 2026), sources linked inline. Companion docs:
`docs/REACT_QUERY_GUIDE.md`, `docs/API Flow Structure Guide for NextJS + FastAPI.md`.

**Two audiences, two languages, two priorities** — don't default to one everywhere:

| | Export storefront (primary site) | Domestic buyback page (secondary) |
|---|---|---|
| Audience | International buyers | Japanese sellers |
| Language | English (primary) | Japanese |
| Currency | USD | N/A — a buyback quote, not a sale |
| Goal | Rank for "used cars/machinery from Japan," convert to a quote request | Capture a lead to call/LINE |

The rest of this document is written for the export storefront, which is the site's real economic
engine. The buyback page gets its own short section at the end.

---

## Cache Components + PPR

Data fetching is dynamic by default; you opt into caching with `"use cache"` — the reverse of
pre-16 behavior.

```ts
// next.config.ts
import type { NextConfig } from 'next';
export default { cacheComponents: true } satisfies NextConfig;
```

Requires the Node.js runtime (drop any `runtime = 'edge'` export). With it on, PPR is the default
rendering model for every route: Next prerenders a static shell and streams dynamic parts into it via
Suspense — no route waits on its slowest piece.

*[cacheComponents](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents) · [use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)*

---

## Unit Detail Page (Vehicle or Heavy Equipment)

One page shape serves both catalogs — `/stock/[slug]`, not a car-only route:

```tsx
// app/(storefront)/stock/[slug]/page.tsx
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { getUnitBySlugServer } from '@/services/stock/stock.server';

async function getCachedUnit(slug: string) {
  'use cache';
  cacheLife('hours');
  cacheTag(`unit:${slug}`);
  return getUnitBySlugServer(slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getCachedUnit(slug);
  if (!unit) notFound();

  return (
    <article>
      <UnitGallery images={unit.images} />
      <UnitDetails unit={unit} />
      <Suspense fallback={<StockStatusSkeleton />}>
        <LiveStockStatus unitId={unit.id} />
      </Suspense>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await getCachedUnit(slug);
  if (!unit) return {};
  return {
    title: `${unit.year} ${unit.make} ${unit.model} — $${unit.price.toLocaleString('en-US')} FOB Japan`,
    description: unit.description.slice(0, 155),
    openGraph: { images: [unit.images[0]?.url] },
  };
}
```

```tsx
// app/(storefront)/layout.tsx — English-primary, its own root layout (see the
// route-group split in "The Domestic Buyback Page" below)
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

`"use cache"` can't read `cookies()`/`headers()`/`searchParams`, even transitively — read those
outside and pass them in as arguments.

Invalidate on write, from wherever the mutation lands (route handler or Server Action) — e.g. when a
unit sells at auction and is removed, or its price changes:

```ts
import { updateTag } from 'next/cache';
updateTag(`unit:${updated.slug}`);
```

`updateTag(tag)` is the one to reach for from a mutation — one argument, no need to know which
`cacheLife` profile tagged the entry. `revalidateTag(tag, profile)` is the older sibling and, as of
Next.js 16, requires that second `profile` argument (matching the `cacheLife` name used when the tag
was set) — easy to get wrong, so default to `updateTag` unless something specifically needs
`revalidateTag`'s profile-aware behavior. Without calling one of them, the public page serves the
stale version for the full `cacheLife` window.

*[Revalidation](https://nextjs.org/docs/app/api-reference/directives/use-cache#revalidation)*

---

## Stock Search / Browse

Results depend on `searchParams` (make, model, price, steering position, auction grade), so they're
legitimately dynamic — PPR still prerenders everything around them.

```tsx
// app/stock/page.tsx
export default async function StockPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <div>
      <StockFilters />
      <Suspense key={JSON.stringify(params)} fallback={<ResultsSkeleton />}>
        <StockResults params={params} />
      </Suspense>
    </div>
  );
}

async function StockResults({ params }: { params: Record<string, string | string[] | undefined> }) {
  const { items } = await searchStockServer(params);
  return <ResultsGrid units={items} />;
}
```

Filter state lives in the URL — shareable (a buyer forwarding a filtered search to a colleague), and
crawlable (a specific make/model/grade combination indexed as its own landing page).

---

## Destination Landing Pages — a Real SEO Asset for This Business

"Used cars from Japan to Kenya," "excavators for export to Tanzania" are real searches with real
commercial intent — the reference site (Nippon Vehicles) builds dedicated pages per destination
country/port for exactly this reason. Each is a `"use cache"` page combining static
shipping/import-duty content with a live stock query filtered to units realistically shippable there:

```tsx
// app/destinations/[country]/page.tsx
import { cacheLife, cacheTag } from 'next/cache';
import { getDestinationInfoServer, searchStockServer } from '@/services/stock';

async function getCachedDestination(country: string) {
  'use cache';
  cacheLife('days'); // shipping/duty info changes rarely
  cacheTag(`destination:${country}`);
  const info = await getDestinationInfoServer(country);
  const { items } = await searchStockServer({ shippable_to: country, limit: 24 });
  return { info, featured: items };
}

export default async function DestinationPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const { info, featured } = await getCachedDestination(country);
  return (
    <div>
      <ShippingGuide port={info.port} incoterms={info.incoterms} dutyNotes={info.dutyNotes} />
      <ResultsGrid units={featured} />
    </div>
  );
}
```

Each destination page is its own indexable URL, with its own `generateMetadata` targeting that
country's search intent — a direct SEO asset the generic "car marketplace" playbook doesn't have a
slot for at all.

---

## Structured Data

```tsx
function UnitJsonLd({ unit }: { unit: Unit }) {
  const json = {
    '@context': 'https://schema.org', '@type': unit.category === 'equipment' ? 'Product' : 'Vehicle',
    name: `${unit.year} ${unit.make} ${unit.model}`,
    image: unit.images.map((i) => i.url),
    offers: { '@type': 'Offer', price: unit.price, priceCurrency: 'USD',
      availability: unit.status === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@type': 'Organization', name: 'M.A.S & SONS', address: {
        '@type': 'PostalAddress', addressCountry: 'JP', addressRegion: '茨城県', addressLocality: '下妻市',
      } } },
    ...(unit.category !== 'equipment' && {
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: unit.mileage, unitCode: 'KMT' },
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
```

`priceCurrency: 'USD'` — the buyer-facing currency. `unitCode: 'KMT'` (kilometers) stays correct
regardless of buyer's country: the odometer itself reads km because the vehicle is Japan-sourced —
that's a fact about the unit, not about who's buying it. The seller's Japan address is a genuine
trust/authenticity signal here ("shipped directly from Japan"), not something to hide — keep it.

---

## Sitemap at Scale

Google caps sitemaps at 50,000 URLs — shard with `generateSitemaps` past that.

```ts
// app/stock/sitemap.ts
import type { MetadataRoute } from 'next';

export async function generateSitemaps() {
  const total = await getActiveStockCountServer();
  return Array.from({ length: Math.ceil(total / 50_000) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const page = Number(await id);
  const units = await getStockSlugsPageServer({ offset: page * 50_000, limit: 50_000 });
  return units.map((u) => ({ url: `https://example.com/stock/${u.slug}`, lastModified: u.updatedAt, changeFrequency: 'daily' }));
}
```

*[generateSitemaps](https://nextjs.org/docs/app/api-reference/functions/generate-sitemaps)*

---

## Images — the LCP Candidate, and a Trust Signal Here Specifically

A buyer who can't inspect the unit in person relies on photos more than in a domestic marketplace —
more angles, not fewer, is a conversion lever here, not just a performance one.

```tsx
<Image src={unit.images[0].url} alt={`${unit.year} ${unit.make} ${unit.model}`}
  width={1200} height={800} priority sizes="(max-width: 768px) 100vw, 800px" />
{unit.images.slice(1).map((img) => (
  <Image key={img.id} src={img.url} alt="" width={400} height={300} loading="lazy" />
))}
```

`priority` on exactly the hero image. Explicit dimensions on every image — prevents CLS. Configure
`images.remotePatterns` for the storage/CDN host.

---

## Turbopack

Default bundler, dev and production, stable — no config needed. Filesystem cache for `next dev` is
also stable; only revisit config if a legacy webpack plugin needs a Turbopack equivalent.

---

## Tailwind v4

```css
/* app/globals.css */
@import "tailwindcss";
@theme {
  --color-brand-600: oklch(0.55 0.2 260);
  --font-sans: "Inter", -apple-system, sans-serif;
}
```

No config file, no `content: []` glob — content detection is automatic. ~6–12 KB gzipped CSS versus
20–30 KB under v3, which matters on a page whose CSS blocks first paint on mobile.

---

## The Domestic Buyback Page — Japanese, Separate, Simple

A single shared root layout can only render one `<html lang>` — so rather than forcing the whole app
under one language, split into two **route groups, each its own root layout** (a documented Next.js
pattern: any layout with no `layout.tsx` above it is a root layout):

```
app/
├── (storefront)/
│   ├── layout.tsx        # <html lang="en"> — the export storefront
│   ├── stock/
│   └── destinations/
└── (jp)/
    ├── layout.tsx        # <html lang="ja"> — the buyback page
    └── sell/
```

```tsx
// app/(jp)/layout.tsx
export default function JpLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
```

```tsx
// app/(jp)/sell/page.tsx
export const metadata = { title: '年式に関係なく高価買取りいたします — M.A.S & SONS' };

export default function SellPage() {
  return <LeadForm />; // name, phone, vehicle/equipment details, photos -> LINE/phone follow-up
}
```

Navigating between the two route groups triggers a full page load rather than a client-side
transition — a non-issue here, since a buyer browsing the English storefront and a Japanese seller
filling out a buyback form are different audiences who essentially never cross-navigate between the
two in one session.

**CJK font-loading applies only here.** A Japanese web font (Noto Sans JP, etc.) is enormous — the
storefront never needs to pay that cost, but this page does:

```css
@theme {
  --font-jp: -apple-system, "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif;
}
```

Default to the system Japanese font stack above — every platform a Japanese seller is on already has
a high-quality Japanese font on-device, zero download cost. Only reach for a custom webfont, via
`next/font` with subsetting and `display: 'swap'`, if the brand genuinely requires one.

No SEO investment needed here beyond basic indexing — this page's job is lead capture from people who
already know the business (via the card, word of mouth, LINE), not organic Japanese search traffic.

---

## Security

- Every route/action validates with Zod — never trust `searchParams` or form data shape.
- `updateTag`/`revalidateTag` only from server code (route handler, Server Action) — never exposed
  to the browser directly.
- `dangerouslySetInnerHTML` for JSON-LD only, with `JSON.stringify` output — never interpolate raw
  input into it unescaped.
- Rate-limit and bound body size on both public write endpoints — the quote-request form and the
  buyback lead form are both unauthenticated and the first target for abuse/spam.
- `images.remotePatterns` — an explicit allowlist, never a wildcard host.
- **APPI (個人情報保護法)** — the buyback page collects a Japanese seller's name/phone/vehicle
  details; state the purpose of use at collection, don't retain longer than needed, don't forward it
  to a third party without that being covered by stated purpose/consent. The storefront's quote-
  request form collects international buyers' data — not APPI's jurisdiction, but apply the same
  discipline (state purpose, bound retention) as a matter of basic practice regardless of which
  country's law technically applies.

---

## Core Web Vitals

- **LCP** — hero image (`priority`, sized, CDN-served) and the first visible stock cards, both
  server-rendered.
- **INP** — filter interactions feel instant; debounce the URL write, not the visual feedback; keep
  the filter panel a small client island.
- **CLS** — reserved dimensions on every image; skeletons matching final layout geometry.

---

## Which Tool, Which Page

| Page | Rendering | Data | Freshness |
|---|---|---|---|
| Unit detail (`/stock/[slug]`) | `"use cache"` + PPR | Direct `.server.ts` | `cacheTag` + `updateTag` on edit/sale |
| Stock search | Dynamic, PPR shell around it | Direct `.server.ts` | Always fresh |
| Destination pages | `"use cache"` (long life) + live featured stock | Direct `.server.ts` | `cacheTag` + `updateTag` |
| Buyer account area | Client-rendered | React Query | Stale-time tiers, mutation invalidation |
| Buyback lead form | Static/dynamic, no cache needed | Server Action | N/A — write-only |
