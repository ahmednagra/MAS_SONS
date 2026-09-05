# M.A.S & SONS 株式会社 — PROJECT ARCHITECTURE

## Production Architecture & Engineering Blueprint
### Next-Generation Japanese Automotive & Heavy Equipment Digital Platform
### Target Horizon: 2026 → 2036

---

## 0. Document Status — Revision 3 (2026-09-04)

Revision 3 follows the client's confirmation of export, online payment and referral
commission, and a direct reading of the supplied business card.

| § | Change |
|---|---|
| 5 | `Payments` and `Attribution` added as domains |
| 8 | Equipment attributes extended to what buyers actually select on |
| 10 | `delivery_term` added, constrained by carriage mode; `price_includes` |
| 16, 16b | Sort keys, `purchasable_area`, alias-aware matching; ordering rules |
| 20 | `/payments`, `/attribution`, `/referrals` boundaries |
| 27 | Reference keys carry an alias set |
| 44b | Payments and settlement model |
| 64 | Settlement, refund, referral and attribution events |
| 65 | Incoterm on `Deal`; pre-shipment inspection artefact; buyer-visible pack |
| 66 | Heavy haulage and voyage fields on delivery |
| 78 | Attribution data is personal data; retention required |
| 82 | Payments decided; remaining sub-decisions listed |

Rationale: `docs/decisions/0002-commerce-capabilities.md`.

### Revision 2 (2026-09-03) — after review against the supplied company material

| § | Change |
|---|---|
| 4 | Project is greenfield; there is no repository to audit |
| 5 | `Acquisition` added as a first-class domain; `Party` unifies buyer and seller |
| 6 | Vehicles and equipment are one entity, not two |
| 9 | Lifecycle extended backwards: `OFFERED / VALUED / DECLINED / PURCHASED` |
| 22 | Parallel vehicle/equipment trees collapsed; `stock/` replaces split routes |
| 27 | Three-class i18n model — structured values are not translated content |
| 64 | Acquisition events added |
| 65 | Deal + document-pack model added |

Rationale: `docs/decisions/0001-lifecycle-and-scope.md`.

---

## 1. Purpose

This document is the technical companion to `MAS_SONS_MASTER_DESIGN_BRIEF.md`.

The Master Design Brief defines the product vision, UX direction, business domains,
performance philosophy, and long-term capabilities.

This document defines the recommended engineering architecture for:

- repository structure
- frontend
- backend/API boundaries
- inventory domains
- search
- media
- localization
- SEO
- caching
- performance
- security
- testing
- observability
- scalability
- future AI and mobile clients

**Important:** this is a reference architecture, not a description of anything that
exists. The project is greenfield. Adopt a structure when the code that needs it is
written; do not materialise this document as empty directories.

---

# 2. Architecture North Star

The website is one client of the M.A.S & SONS platform, not the entire platform.

```text
                    M.A.S & SONS PLATFORM
                              |
          +-------------------+-------------------+
          |                   |                   |
       Website             Admin/CMS          Future Apps
          |                   |                   |
          +-------------------+-------------------+
                              |
                         Domain/API Layer
                              |
       +----------------------+----------------------+
       |                      |                      |
   Inventory              Customers             Operations
       |                      |                      |
       +----------------------+----------------------+
                              |
                    Data / Search / Media
```

The architecture must support future web, mobile, AI, partner, and operational clients
without duplicating business logic.

---

# 3. Architectural Priorities

Use this order when making engineering decisions:

1. Correctness
2. Business-rule integrity
3. Security
4. Performance
5. Reliability
6. Maintainability
7. Accessibility
8. SEO
9. Scalability
10. Visual sophistication

Never sacrifice correctness or business truth for visual polish.

---

# 4. Preserve Existing Work

**Status: greenfield as of 2026-09-03.** There is no existing repository. The
migration and preservation risk this section is organised around does not yet
apply, and Phase 0 is a decision-and-scaffold phase rather than an audit.

This section applies in full from the first commit onward, and to any later session
inheriting the codebase. Once an implementation exists, before further work Claude
Code MUST inspect:

- framework
- frontend architecture
- backend architecture
- routing
- APIs
- database
- authentication
- authorization
- business logic
- styling
- components
- tests
- deployment
- CI/CD
- integrations
- environment configuration
- current performance

For every proposed major change document:

```text
Current State
Problem
Proposed State
Reason
Migration Impact
Risk
Validation
```

Preserve strong existing architecture where it is already better than this reference.

---

# 5. Domain Architecture

Major domains:

```text
Identity
Company
Acquisition
Inventory
Search
Media
Inspection
Documents
Pricing
Payments
Availability
Customers
Leads
Attribution
Sourcing
Trade-In
Export
Delivery
Reservations
Appointments
Favorites
Comparison
Notifications
Content
Reviews
Analytics
AI
```

> **Revision 2.** `Vehicles` and `Equipment` were removed as domains — they are
> specification schemas resolved from `category` on one `InventoryItem`, per §6, not
> boundaries. `Valuation` was folded into `Acquisition`, which owns it.

> **Revision 3.** `Payments` and `Attribution` added. Payments previously appeared
> only in §82's list of ADRs someone should eventually write, while §9 already carried
> a `RESERVED` state and Brief §24 already offered a Reserve action — so reservations,
> deposits and refunds had no owning domain. Attribution was absent entirely: Brief
> §6b captured an origin channel on unit records, but buyer enquiries carried nothing,
> and none of it can be backfilled. See ADR 0002 Decisions 3 and 5.

`Payments` owns invoicing, settlement against a `Deal`, reconciliation and refunds.
It is method-agnostic: 銀行振込, telegraphic transfer, card and escrow are recorded
methods, not separate architectures. Referral **commission** accrues here; referral
**tracking** belongs to `Attribution`.

`Attribution` owns first-touch and last-touch marketing provenance on both seller
intake and buyer enquiry, plus referral codes and partner records.

`Acquisition` owns everything from first seller contact to a purchased unit
entering stock: intake, valuation, offer, decline, purchase, collection. It is the
entry point of the inventory lifecycle, not a category of lead. `Leads` covers
buyer-side enquiries only.

Sellers and buyers are **roles on a single `Party` record**, not separate tables.
The same construction firm may sell a dump truck one year and buy a wheel loader
the next; splitting them into `Seller` and `Customer` discards that relationship and
duplicates contact data.

Do not implement all domains immediately. Build extension points without
premature complexity.

---

# 6. Inventory as the Core Domain

Conceptual model:

```text
InventoryItem
├── id
├── slug
├── category
├── type
├── manufacturer
├── model
├── variant
├── status
├── acquisition        ← seller (Party), channel, intake date, valuation, offer,
│                        decline reason, purchase price, collection date
├── pricing
├── location
├── specifications
├── condition
├── history
├── features
├── media
├── inspections
├── documents
├── delivery
└── timestamps
```

A unit record is created at **first contact**, not at purchase. An item that was
offered and declined is a complete `InventoryItem` whose lifecycle ended at
`DECLINED`. See §9.

Vehicles and equipment are **one entity**, not two. They share the record, the
lifecycle, the media model, the document model, the card, and the detail template.
They differ only in which specification schema applies, resolved from `category`.

Do not create parallel `Vehicle` and `Equipment` models, components, or routes.
That doubles the maintained surface area to express one axis of variation, and the
two trees drift apart within months. See §7, §8, §22.

---

# 7. Vehicle Domain

Potential structured attributes:

```text
make
model
variant
model_year
registration_year
mileage_km
engine_cc
fuel_type
transmission
drive_type
body_type
doors
seats
exterior_color
interior_color
inspection_status
inspection_expiry
accident_history
repair_history
smoking_status
pet_status
condition
location
```

Only implement fields supported by actual business data.

---

# 8. Equipment Domain

Potential structured attributes:

```text
manufacturer
model
model_year
operating_hours
operating_weight
weight_class              banded — buyers shop by class, not by kilogram
engine
engine_power
fuel_type
emission_standard         排出ガス規制対応 — gates Japanese public-works use
dimensions
attachment
auxiliary_hydraulics      配管付 / 併用配管付 — decides breaker compatibility
arm_configuration         標準 / オフセット / スライド / ロング / ショート / 解体機仕様
undercarriage_type        ゴムキャタ / 鉄キャタ / パッド付 / 湿地シュー
shoe_width
undercarriage_wear        per component, where assessed
crane_specification       capacity, boom sections, jib — where applicable
serial_number             stolen-machine checks run on this
inspection_record         特定自主検査, distinct from 車検 in §7
drive_type
condition
maintenance_history
location                  pickup prefecture — the input to a haulage quote
purchasable_area          domestic only / overseas eligible
```

> **Revision 3.** The first list was the generic set. Everything added above is a
> facet the leading Japanese used-equipment marketplaces actually sell on, and a
> machine that cannot be filtered by them is effectively invisible. Two are not
> merely commercial: `emission_standard` governs which machines may legally operate
> on Japanese public-works sites, and `serial_number` is what a stolen-machine check
> runs against. See ADR 0002 and Brief §19.

Only implement fields supported by actual business data. Where a value is unknown it
is `NULL`, never a default — see §16b on how ordering must treat that.

Supported business categories may include:

- excavators
- wheel loaders / tire shovels
- bulldozers
- tractors
- crane trucks / crane vehicles
- trailers
- dump trucks
- trucks
- other machinery

The taxonomy must remain extensible.

---

# 9. Inventory Lifecycle

One lifecycle covers both acquisition and sale:

```text
OFFERED       seller has approached us; not yet valued
VALUED        a number has been produced and given
DECLINED      terminal — we passed, or the seller refused
PURCHASED     bought, not yet collected
DRAFT         in yard, being prepared and photographed
AVAILABLE     published
RESERVED      committed to a buyer
SOLD          terminal
UNAVAILABLE   temporarily withdrawn
ARCHIVED      terminal
```

**Why this changed.** Revision 1 began the list at `DRAFT` — after ownership. That
left no home for the acquisition half of the business, which is the half the company
leads with, and discarded every declined offer at the moment of highest value.

`OFFERED`, `VALUED`, `DECLINED`, and `PURCHASED` are never publicly visible. Only
`AVAILABLE` and `RESERVED` appear in the public catalogue. `DECLINED` records are
retained permanently.

Do not add further statuses without a recorded decision.

Availability is business-critical and must not depend solely on stale browser state.

---

# 10. Pricing Architecture

Separate:

```text
base_price
sale_price
currency
price_status
price_type
delivery_term             reference key — see below
carriage_mode             road | sea | inland_waterway
price_includes[]          structured, not prose
```

Possible semantic states:

```text
CONFIRMED
ESTIMATED
QUOTE_REQUIRED
```

## Delivery terms

`price_status` answers *how certain is this number*. `delivery_term` answers *what it
includes and where responsibility ends*. They are orthogonal; both are required on a
published price.

```text
Domestic     store_pickup      店頭渡し
             delivered         納車渡し
             on_truck          車上渡し      buyer unloads
             unloaded          荷卸し込み    we unload

Export       EXW · FOB · CFR · CIF and other Incoterms 2020 codes
```

Two constraints the schema enforces, not merely documents:

1. **The code is `CFR`.** The ampersand form still printed by reference exporters was
   retired from the ICC rules; `CNF` survives only because early SWIFT systems could
   not carry an ampersand. Storing the retired form embeds a dead key that becomes
   expensive to change once records reference it.
2. **`CFR` and `CIF` are valid only where `carriage_mode` is sea or inland waterway.**
   A machine sold ex-yard or moved by road cannot carry them. Validate this at the
   domain layer; a free-choice dropdown will otherwise produce quotes that mean
   nothing.

`price_includes[]` is structured so one record drives the listing, the quotation and
the invoice — vehicle, inland transport, inspection, documents, freight, insurance.

Never present estimated shipping, taxes, duties, customs, or transport charges as
confirmed transaction prices.

---

# 11. Media Architecture

Media must be independent from inventory components.

Conceptual model:

```text
MediaAsset
├── id
├── inventory_id
├── type
├── url
├── thumbnail_url
├── width
├── height
├── format
├── sort_order
├── alt_text
└── metadata
```

Types may include:

```text
IMAGE
VIDEO
360
DOCUMENT_PREVIEW
AUCTION_SHEET
INSPECTION
```

Never download a complete gallery when the user only needs the first images.

---

# 12. Media Pipeline

Preferred production pipeline:

```text
Upload
↓
Validate
↓
Store Original
↓
Background Processing
↓
Generate Derivatives
↓
Generate Thumbnails
↓
Generate Modern Formats
↓
CDN
```

Use:

- AVIF/WebP where supported
- responsive image sizes
- correct dimensions
- CDN
- lazy loading
- LQIP/blur placeholders where useful
- priority only for LCP media

Heavy processing must not block customer requests.

---

# 13. Document Architecture

Possible documents:

- inspection sheets
- auction sheets
- vehicle documents
- maintenance records
- export documents
- transaction documents

Separate public documents from private documents.

Private documents require authorization and must not use predictable public URLs.

---

# 14. Inspection Architecture

Structured inspection data should support:

```text
Inspection
├── inspector
├── date
├── overall_status
├── exterior
├── interior
├── mechanical
├── engine
├── transmission
├── undercarriage
├── hydraulics
├── attachments
├── findings
└── source_document
```

Never generate inspection claims from UI assumptions.

---

# 15. Search Architecture

Concept:

```text
SearchQuery
↓
SearchService
↓
Inventory Repository
↓
Optional Search Index
↓
Search Results
```

Start with database search when it is sufficient.

Introduce a dedicated search engine only when measured scale/query complexity
justifies it.

Do not add Elasticsearch/OpenSearch/Algolia merely because this is a marketplace.

---

# 16. Search Requirements

Potential filters:

```text
keyword
make
model
category
price
year
mileage
operating_hours
fuel
transmission
drive
body_type
equipment_class
weight_class
emission_standard
auxiliary_hydraulics
arm_configuration
undercarriage_type
condition
location
purchasable_area
sort
```

Keyword matching is **alias-aware**. Reference keys carry an alias set (§27), so a
query for ユンボ matches records stored as `hydraulic_excavator` and rendered
油圧ショベル. Without this the catalogue returns nothing for the words the business
itself advertises.

Only expose filters backed by real structured data.

---

# 16b. Sorting and Result Ordering

Sorting resolves from the active category, exactly as facets do under ADR 0001
Decision 2. Mileage ordering is meaningless on an excavator; operating-hours ordering
is meaningless on a passenger car. One index, one results page, one URL scheme, a
category-selected sort set.

```text
Both          listed_desc          default
              price_asc / price_desc
              year_desc / year_asc
              reduced_desc         only where sale_price is set
              enquiries_desc       demand signal
              reference

Vehicles      mileage_asc / mileage_desc
Equipment     hours_asc / hours_desc
```

Three requirements. Each is a defect, not a refinement:

**Deterministic tiebreaker.** Every sort resolves ties on a unique column — the
identifier or created timestamp. Without it, two items at the same price have no
stable order, the database is free to return them differently per query, and
pagination silently duplicates some records and drops others.

**Explicit NULL placement.** An item with no recorded operating hours must not appear
first under `hours_asc`. Unknown is not zero. State the placement per sort rather than
inheriting whatever the database defaults to, and note that the default differs
between engines and between `ASC` and `DESC`.

**Index coverage.** Each offered sort has a supporting index that includes the
tiebreaker column, or the sort becomes a full scan as inventory grows (§35).

The active sort is a URL parameter (§17), never client-only state.

---

# 17. URL-Driven Search

Search state should be represented in URLs.

Example:

```text
/inventory?category=equipment&maker=komatsu&weight_class=10_17t&sort=hours_asc
```

Benefits:

- shareable searches
- browser history
- SEO
- analytics
- saved searches
- reproducibility
- server-side rendering

Do not keep primary search state only in React memory.

---

# 18. Pagination

Use efficient server-side pagination.

Choose:

- cursor pagination for large/high-change datasets where justified
- offset pagination when it is demonstrably sufficient

Never send thousands of inventory records to the browser unnecessarily.

---

# 19. API-First Principle

Prefer:

```text
UI
↓
Feature Service
↓
API Client
↓
Domain API
↓
Repository
↓
Database
```

Avoid:

```text
UI Component
↓
Database-specific logic
```

The domain/API layer should support future:

- mobile applications
- AI assistants
- partner integrations
- internal tools
- messaging integrations

---

# 20. API Boundaries

Conceptual domains:

```text
/inventory
/acquisition
/search
/media
/inspections
/documents
/customers
/favorites
/comparisons
/valuations
/sourcing
/trade-ins
/export
/delivery
/payments
/attribution
/referrals
/appointments
/content
/notifications
```

Endpoints should represent meaningful domain operations, not individual UI components.

> **Revision 2.** `/vehicles` and `/equipment` were removed. They are one entity;
> category is a query parameter on `/inventory`, never a separate API surface.
> `/acquisition` was added — it owns intake, valuation, offer, decline, purchase and
> collection, and is the entry point of the lifecycle rather than a kind of lead.

> **Revision 3.** `/payments`, `/attribution` and `/referrals` added, matching the
> domains in §5. `/payments` is internal-facing plus a narrow public surface for a
> hosted checkout callback; it never returns another party's settlement data.
> `/attribution` is write-mostly and never public-readable — provenance is business
> intelligence, not customer-facing content (§43).

---

# 21. Frontend Architecture

The rendering model is server-first. The framework is an open decision recorded in
Phase 0 of the Implementation Plan; whichever is chosen must support this rule.

Rule:

```text
Server by default.
Client only when interaction requires it.
```

Client components are appropriate for:

- interactive filters
- galleries
- favorites
- comparison
- forms
- modals
- account interactions
- highly interactive search

Do not turn the entire application into a client-rendered application.

---

# 22. Recommended Repository Structure

This is a reference structure for a monorepo. Create a directory when the first
file that belongs in it is written — never ahead of it.

```text
mas-sons/
│
├── app/
│   ├── [locale]/                 # ja | en — §29 requires /ja/… and /en/…
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   ├── showroom/
│   │   │   ├── contact/
│   │   │   ├── legal/            # 古物商 / 特商法 display — launch blocker
│   │   │   └── sell/
│   │   │
│   │   ├── stock/
│   │   │   ├── page.tsx          # one catalogue; category is a filter
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # one detail template
│   │   │
│   │   ├── compare/
│   │   ├── favorites/
│   │   ├── source/
│   │   ├── export/
│   │   └── journal/
│   │       └── [slug]/
│   │
│   ├── (internal)/               # staff-only; ships before the public site
│   │   ├── acquisition/          # M2 — intake, valuation, offer
│   │   ├── stock/                # M3 — status changes, media, preparation
│   │   ├── deals/                # M7 — document packs
│   │   └── admin/                # M15 — depth and bulk operations
│   │
│   ├── api/
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   └── globals.css
│
├── components/
│   ├── ui/
│   │   ├── button/
│   │   ├── input/
│   │   ├── select/
│   │   ├── dialog/
│   │   ├── drawer/
│   │   ├── tabs/
│   │   ├── badge/
│   │   └── skeleton/
│   │
│   ├── layout/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── navigation/
│   │   └── container/
│   │
│   ├── inventory/
│   │   ├── inventory-card/
│   │   ├── inventory-grid/
│   │   ├── inventory-list/
│   │   ├── inventory-empty/
│   │   ├── inventory-gallery/
│   │   ├── inventory-specifications/   # schema selected by category
│   │   ├── inventory-condition/
│   │   └── inventory-features/
│   │
│   ├── acquisition/
│   │   ├── intake-form/
│   │   ├── valuation-panel/
│   │   └── comparables/
│   │
│   ├── search/
│   │   ├── search-bar/
│   │   ├── filter-panel/
│   │   ├── filter-drawer/
│   │   ├── sort-control/
│   │   └── search-summary/
│   │
│   ├── media/
│   │   ├── image/
│   │   ├── gallery/
│   │   ├── video/
│   │   ├── viewer-360/
│   │   └── document-viewer/
│   │
│   ├── forms/
│   │   ├── contact/
│   │   ├── acquisition/          # valuation + trade-in are one workflow
│   │   ├── sourcing/
│   │   └── export/
│   │
│   └── content/
│       ├── hero/
│       ├── section/
│       ├── testimonial/
│       ├── faq/
│       └── journal/
│
├── features/
│   ├── acquisition/
│   ├── inventory/
│   ├── search/
│   ├── payments/                 # §44b — ledger, reconciliation, refunds
│   ├── attribution/              # §5 — first/last touch, referral codes
│   ├── favorites/
│   ├── comparison/
│   ├── sourcing/
│   ├── export/
│   ├── delivery/
│   ├── appointments/
│   └── account/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── cache/
│   ├── db/
│   ├── seo/
│   ├── i18n/
│   ├── analytics/
│   ├── validation/
│   ├── formatting/
│   ├── performance/
│   └── security/
│
├── hooks/
├── types/
├── config/
├── messages/                    # class 1 — interface strings
│   ├── en.json
│   └── ja.json
├── reference/                   # class 2 — label_ja / label_en + alias sets
├── content/                     # class 3 — free text, authored twice
│   ├── en/
│   └── ja/
├── public/
│   ├── fonts/
│   ├── icons/
│   └── static/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── accessibility/
├── e2e/
├── scripts/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   ├── design-system/
│   ├── deployment/
│   ├── operations/
│   └── decisions/
│
├── .env.example
├── package.json
├── tsconfig.json
│
├── MAS_SONS_MASTER_DESIGN_BRIEF.md
├── MAS_SONS_PROJECT_ARCHITECTURE.md
└── MAS_SONS_IMPLEMENTATION_PLAN.md
```

Do not create every folder immediately. Create structure as real requirements emerge.

> **Revision 2.** Four corrections. A `[locale]` segment was added — §29 specifies
> `/ja/stock/…` and `/en/stock/…` and the tree had no way to express it. `messages/`
> and `reference/` were added: the tree previously provided only `content/en|ja`,
> which is class 3 of the three-class i18n model in §27, leaving interface strings
> and the `label_ja`/`label_en` reference tables with nowhere to live — and those
> reference tables are the decision that makes bilingual free or permanently
> expensive. An `(internal)` route group was added, because M1–M3 ship before any
> public page and had no home. `valuation/` and `trade-in/` were merged into
> `acquisition/`: they were two directories for one workflow.

---

# 23. Component Architecture

Three levels:

## Level 1 — UI primitives

```text
Button
Input
Badge
Dialog
Drawer
Tabs
Skeleton
```

No automotive business knowledge.

## Level 2 — Domain components

```text
InventoryCard
InventorySpecifications   # schema selected by category
InventoryCondition
InventoryGallery
AcquisitionIntakeForm
```

Understand domain data.

## Level 3 — Feature components

```text
InventoryFilters
ValuationWizard
SourcingWizard
ExportQuote
ComparisonWorkspace
```

Understand user workflows.

Never put business workflows into basic UI primitives.

---

# 24. Feature Ownership

A feature may own:

```text
components
hooks
schemas
services
types
tests
```

Example:

```text
features/search/
├── components/
├── hooks/
├── schemas/
├── services/
├── types.ts
└── tests/
```

Avoid a giant global `utils` directory.

---

# 25. Design System Architecture

Create a single source of truth for:

- colors
- typography
- spacing
- radii
- shadows
- breakpoints
- motion
- z-index
- states

Prefer design tokens.

Do not scatter arbitrary values across components.

---

# 26. Responsive Architecture

Support:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

Do not optimize only for 1440px desktop and 375px mobile.

Layouts should adapt between breakpoints.

---

# 27. Internationalization

Customer-facing languages are exactly:

```text
English
Japanese
```

Do not expose additional languages.

Use clean locale separation:

```text
en
ja
```

Keep translations separate from component structure.

Do not spread language conditionals throughout components.

## Three classes of text

Treating JA/EN as two content sets to maintain is the expensive mistake. Split it:

```text
1. Interface strings   → message catalogues
2. Structured values   → reference tables carrying label_ja and label_en;
                         records store the key only
3. Free text           → the only content genuinely authored twice
```

Category, manufacturer, status, condition grade, fuel type, drive type, delivery
term, payment method, destination and document name are all class 2. A unit stores
`maker: komatsu`, never the string "コマツ". The record then renders in either
language with no translation step and no duplicated row.

## Reference keys carry an alias set

Each key holds `label_ja`, `label_en`, **and a set of aliases used for search
matching only** — never for display.

```text
key: hydraulic_excavator
label_ja: 油圧ショベル
label_en: Hydraulic Excavator
aliases:  ユンボ, バックホー, backhoe, excavator, ユンボー
```

**Why this is not optional.** The company's own business card advertises ユンボ and
タイヤショベル. A catalogue record will store `hydraulic_excavator` and render
油圧ショベル. Without aliases, a domestic buyer searching the exact word the business
prints on its card gets zero results. The cost is one column at M1; retrofitting it
means re-indexing every record. See ADR 0002 Decision 8.

Class 3 is limited to condition notes and editorial content. Keep it small: every
field promoted from class 3 into class 2 removes translation work permanently.
Getting the reference tables right in the first phase makes bilingual close to free
for the life of the platform.

Japanese must be treated as a native experience.

---

# 28. SEO Architecture

Public pages should support:

- canonical URLs
- metadata
- Open Graph
- breadcrumbs
- structured data where appropriate
- sitemap
- controlled indexing

Do not index meaningless combinations of filters or private pages.

---

# 29. Inventory SEO

Preferred conceptual routes:

```text
/ja/stock/komatsu-pc138us-11-2019
/en/stock/komatsu-pc138us-11-2019
```

One route family for all categories. Splitting `/vehicle/` and `/equipment/`
forces a taxonomy decision into the URL, and every item that sits awkwardly across
the line — a crane truck, a tractor — becomes a redirect problem later. Category is
a facet, not a path segment.

Use stable slugs.

For sold inventory, where useful:

- preserve the URL
- show sold status
- show similar inventory

Do not misrepresent availability.

---

# 30. Data Fetching

Avoid duplicate requests.

Use:

- server-side fetching where appropriate
- request deduplication
- caching
- selective prefetching
- pagination
- streaming where beneficial

Do not prefetch every route or every gallery.

---

# 31. Client State

Do not put server data into global client state by default.

Prefer:

```text
URL state
+
Server state
+
Local component state
```

Introduce a query/cache library only when it solves a real synchronization problem.

---

# 32. Performance Philosophy

The platform follows a:

# 20× PERFORMANCE MINDSET

This is an engineering ambition to eliminate waste. It is not permission to claim
a literal 20× improvement without measurement.

For every expensive operation ask:

```text
Can we avoid it?
Can we defer it?
Can we cache it?
Can we batch it?
Can we precompute it?
Can we move it server-side?
Can we reduce its payload?
Can we make it incremental?
Can we remove the dependency?
```

---

# 33. Performance Budgets

Measure:

- LCP
- INP
- CLS
- TTFB
- JavaScript transfer
- CSS transfer
- image transfer
- request count
- API latency
- database latency
- cache hit rate

Establish actual thresholds after baseline measurement.

Performance regression should be visible and preferably block releases when critical
budgets are exceeded.

---

# 34. Database Performance

Required principles:

- correct indexes
- query planning
- connection pooling
- bounded queries
- selective projections
- pagination
- no N+1 queries
- monitoring

Do not use `SELECT *` in performance-sensitive paths.

Indexes must reflect actual query patterns.

---

# 35. Large Inventory

The system should remain usable with:

```text
100
1,000
10,000
100,000+
```

Use:

- server-side filtering
- pagination/cursors
- efficient search
- cached aggregates where justified
- CDN media
- virtualization only where justified

Never render the complete inventory in the browser.

---

# 36. Caching

Categorize data.

### Stable

```text
company
navigation
categories
legal content
```

Longer caching/revalidation.

### Medium volatility

```text
inventory
search
recommendations
```

Controlled caching.

### High volatility

```text
availability
reservation
transaction state
```

Strong freshness guarantees.

Never allow stale cache to misrepresent critical transaction state.

---

# 37. Cache Invalidation

When inventory changes:

```text
Inventory Updated
↓
Invalidate affected cache
↓
Update derived search representation
↓
Refresh affected pages
```

Do not globally purge all caches for every change.

---

# 38. High-Load Resilience

Use where justified:

- CDN
- caching
- rate limiting
- timeouts
- bounded retries
- circuit breakers
- background jobs
- queues
- backpressure
- graceful degradation

Do not create distributed complexity without a measured need.

---

# 39. Graceful Degradation

Optional systems must fail independently.

```text
AI unavailable
→ Inventory still works

Analytics unavailable
→ Customer journey still works

Recommendations unavailable
→ Inventory still works

360 unavailable
→ Standard gallery still works

Shipping estimate unavailable
→ Show quote-required state
```

The core journey must remain reliable:

```text
Open
→ Search
→ View
→ Understand
→ Contact
```

---

# 40. Security

Protect:

- customer data
- accounts
- documents
- inquiries
- transactions
- internal operations

Use:

- authentication
- authorization
- input validation
- rate limiting
- secure session/token handling
- secure headers
- safe file uploads
- audit logging

Never expose private documents through predictable public URLs.

---

# 41. Upload Security

For every upload:

```text
Validate type
↓
Validate size
↓
Generate safe storage name
↓
Store securely
↓
Scan where required
↓
Generate derivatives asynchronously
↓
Restrict private access
↓
Audit sensitive access
```

Never trust browser-supplied MIME types or filenames.

---

# 42. API Response Design

Return only the data required for the view.

Conceptual read models:

```text
InventoryCardProjection
InventoryDetailProjection
SearchResultProjection
```

Do not send internal-only data to public clients.

---

# 43. Public vs Internal Data

Public inventory may expose approved:

- specifications
- media
- price
- condition
- availability

Never expose internal fields such as:

```text
purchase_cost
supplier_notes
internal_margin
private_document_url
internal_valuation
```

---

# 44. Business Workflow Modules

Keep these workflows independent:

```text
Sell
Trade-In
Source
Export
Reservation
Appointment
Contact
```

Do not create one giant universal form.

---

# 44b. Payments and Settlement

> **Revision 3.** Payments existed only as a bullet in §82's list of ADRs to write,
> while §9 already carried `RESERVED` and Brief §24 already offered a Reserve action.
> ADR 0002 Decision 3 makes it a domain.

## The ledger is the core; methods are recorded against it

```text
Invoice
├── deal
├── currency
├── lines[]              item, transport, inspection, documents, freight
├── total
├── issued_at
├── due_at
└── status               DRAFT | ISSUED | PART_PAID | PAID | VOID

Payment
├── invoice
├── method               → SettlementMethod
├── amount               may be partial; several per invoice
├── received_at          value date, not entry date
├── external_reference   remittance ref, transaction id, escrow id
├── reconciled_by        actor, for manually matched transfers
└── status               PENDING | CLEARED | FAILED | REFUNDED
```

`SettlementMethod` is a reference table: 銀行振込, telegraphic transfer, card, escrow.
Adding a method must never require a schema change. **This trade settles
overwhelmingly by transfer** — a design in which card processing is load-bearing
would be built around the exception.

## Rules

- **Never store a card number.** Hosted fields or hosted checkout only; no PAN at
  rest, in logs, in analytics, or in support tooling. Card processing stays outside
  our compliance boundary by construction, not by policy.
- **3-D Secure is mandatory on cross-border card capture.** Card fees on
  vehicle-value transactions are material and cross-border chargebacks on high-value
  goods are a real exposure; this is the one control that meaningfully shifts it.
- **Every write is idempotent under an idempotency key.** Gateway callbacks retry. A
  repeated callback must never double a payment, a refund or a commission accrual.
- **Manual reconciliation is a first-class path**, not an admin afterthought. Most
  money will arrive as a bank transfer that no webhook announces, and a person will
  match it. Record who matched it and when.
- **Refunds are modelled, not improvised** — reason, actor, and the original payment
  they reverse.
- **Money is never a floating-point number.** Minor units as integers, currency
  stored alongside every amount.
- Settlement figures are internal until a deal exists; §43 already forbids exposing
  internal financial fields on public responses.

## Legal boundary

Publishing payment methods triggers 特定商取引法 通信販売 disclosure — see Brief §2b.
Treat that page as a blocker on this work specifically, not general footer content.

---

# 45. Favorites

Anonymous users may save favorites locally where appropriate.

Authenticated users should synchronize favorites server-side.

When an anonymous user signs in, merge state safely.

---

# 46. Comparison

Comparison must operate on normalized structured attributes.

Vehicles and equipment can share comparison infrastructure while using different
attribute schemas.

Do not compare free-text descriptions.

---

# 47. Future Customer Account

Potential account model:

```text
profile
favorites
saved searches
comparisons
inquiries
valuations
sourcing requests
purchases
documents
appointments
delivery tracking
service history
```

Do not require account creation for ordinary browsing.

---

# 48. AI Architecture

AI should remain an optional domain service.

Concept:

```text
Customer
↓
AI Interface
↓
AI Orchestrator
↓
Verified Domain Tools
↓
Inventory / Search / Content / Policies
```

AI must not have unrestricted database access.

Use explicit domain tools.

---

# 49. AI Truth Policy

AI may reason over:

- verified inventory
- approved company content
- approved policies
- structured specifications

AI must never invent:

- prices
- availability
- mileage
- operating hours
- condition
- warranties
- inspection results
- shipping costs
- taxes
- duties
- legal claims

When information is unavailable:

```text
I don't have verified information for that.
```

---

# 50. Recommendation Architecture

Start with:

```text
rule-based matching
```

Then, when sufficient data exists:

```text
inventory attributes
+
customer preferences
+
behavioral signals
```

Only later consider ML ranking.

Do not build ML infrastructure before the data justifies it.

---

# 51. Admin / CMS

The internal system should eventually manage:

```text
Inventory
Media
Specifications
Condition
Inspection
Documents
Pricing
Availability
Leads
Customers
Content
Reviews
Settings
```

Use role-based access.

---

# 52. Audit Logging

Important operations should be auditable:

```text
price changed
status changed
inventory published
inventory unpublished
document uploaded
customer record changed
lead status changed
```

Record where appropriate:

```text
actor
action
resource
timestamp
before/after values
```

Do not log sensitive information unnecessarily.

---

# 53. Testing Architecture

Use:

```text
Unit
  ↑
Integration
  ↑
E2E
```

Do not rely entirely on E2E.

Critical flows:

```text
Homepage
→ Inventory
→ Search
→ Filter
→ Detail
→ Contact

Inventory
→ Favorite

Inventory
→ Compare

Sell
→ Submit

Source
→ Submit

English
↔ Japanese
```

Add transaction/export coverage when those workflows actually exist.

---

# 54. Accessibility

Target WCAG 2.2 AA.

Requirements:

- semantic HTML
- keyboard navigation
- visible focus
- correct labels
- contrast
- alt text
- accessible forms
- adequate touch targets
- reduced-motion support

Accessibility is part of implementation, not final QA only.

---

# 55. Visual Regression

Consider visual regression testing for:

- homepage
- inventory
- stock item detail
- mobile navigation
- search/filter

---

# 56. CI/CD

Recommended pipeline:

```text
Install
↓
Lint
↓
Typecheck
↓
Unit Tests
↓
Integration Tests
↓
Build
↓
Accessibility Checks
↓
Performance Checks
↓
E2E / Smoke Tests
↓
Deploy
↓
Health Check
```

Keep the pipeline reliable and avoid noisy checks.

---

# 57. Feature Flags

Use flags for risky/new capabilities:

```text
ai_concierge
recommendations
360_viewer
export_quote
saved_search_alerts
```

Do not let temporary flags become permanent architecture.

---

# 58. Dependency Policy

Every dependency must justify:

- functionality
- bundle cost
- security
- licensing
- maintenance
- performance

Prefer existing project dependencies and platform capabilities when sufficient.

Do not install a library for a trivial function.

---

# 59. Third-Party Scripts

For every third-party script ask:

```text
Is it necessary?
Can it load after interaction?
Can it be deferred?
Can it be removed?
```

Third-party systems must never block the core customer experience.

---

# 60. Monolith-First Principle

Prefer:

```text
Modular Monolith
+
Clear Domain Boundaries
+
Background Workers
+
Stable APIs
```

Benefits:

- simpler operations
- lower cost
- faster development
- easier debugging
- easier deployment

Extract services only when real scale or operational boundaries justify it.

---

# 61. Future Service Extraction

Potential future independent services:

```text
Search
Media Processing
AI
Notifications
Analytics
```

Do not split vehicle, equipment, customer, or pricing domains into microservices
merely for architectural fashion.

---

# 62. Background Jobs

Good candidates:

- image processing
- document extraction
- OCR
- AI processing
- notification delivery
- search indexing
- analytics aggregation

Keep customer-facing requests short.

---

# 63. Search Index

If a dedicated index is introduced:

```text
Primary Database
↓
Change/Event
↓
Index Worker
↓
Search Index
```

The database remains authoritative.

The search index is derived state.

---

# 64. Domain Events

Potential future events:

```text
UnitOffered
UnitValued
OfferDeclined
UnitPurchased
InventoryPublished
InventoryUpdated
InventoryReserved
InventorySold
LeadCreated
ValuationRequested
SourcingRequested
ExportRequested
DocumentUploaded
DocumentPackCompleted
InvoiceIssued
PaymentReceived
PaymentFailed
RefundIssued
EnquiryAttributed
ReferralAttributed
CommissionAccrued
```

Introduce events when integrations/asynchronous workflows justify them.

---

# 65. Export Architecture

If operationally supported:

```text
ExportRequest
├── inventory_item
├── destination_country
├── destination_port
├── transport
├── delivery_term            Incoterms 2020 key — see §10
├── inspection               → PreShipmentInspection, where required
├── documents
├── quote
├── status
└── timeline
```

Do not hard-code one country's process.

> **Revision 3.** Export is a confirmed capability (ADR 0002 Decision 1). This section
> is an active specification. Destination countries remain an open question — a
> confirmed capability is not a confirmed destination list.

## Pre-shipment inspection is an artefact

Several destinations require third-party inspection before shipment; the recognised
bodies are JEVIC, QISJ and EAA.

```text
PreShipmentInspection
├── deal
├── body                 reference key
├── booked_at / inspected_at
├── result
├── certificate          → Document
└── destination_rule     which requirement it satisfies
```

These inspections include a radiation test and the company operates in Ibaraki, so
this is not a generic export checkbox for this seller. Model it as a document with an
issuing body and a result, never as a sentence in a guide.

## Destination rules as data

Age limits, steering side, emission thresholds and inspection regimes vary by
destination. Held as structured rules, a listing can state that it is not eligible
for a route rather than letting the buyer discover it at customs. This is the same
field the catalogue exposes as `purchasable_area` in §8 and §16.

## Deals and document packs

Domestic and export sales are the same transaction diverging only at the paperwork.
Model that divergence once:

```text
Deal
├── inventory_item
├── type              domestic | export
├── buyer             → Party
├── destination
├── value
└── documents[]       → checklist instantiated from a template
                        selected by type + destination
```

Illustrative templates:

```text
domestic:  請求書 · 移転登録（名義変更）· 自動車税納税証明書 · 引渡書

export:    輸出抹消仮登録証明書 · Export Certificate · commercial invoice ·
           packing list · B/L · marine insurance
           (+ pre-shipment inspection where the destination requires it)
```

A checklist that knows what is still missing is most of the operational value of
this domain. **Verify every template against current requirements with the company
before relying on it** — the lists above are illustrative, not authoritative, and
destination requirements change.

The export template additionally carries the pre-shipment inspection certificate
where the destination requires one.

## The buyer sees the pack too

The checklist is internal, but the buyer needs the documents. Expose a scoped,
authenticated view of the deal's completed documents — invoice, B/L, Export
Certificate, inspection certificate, 譲渡証明書 — with per-document authorisation and
non-guessable URLs (§13, §40). Never expose the checklist's internal state, only the
artefacts already released to that party.

## Machinery that is not road-registered

The domestic template above assumes a registered vehicle. Machinery without road
registration has **no 車検証 and no 名義変更**; it transfers on 売買契約書 and
譲渡証明書, with 特定自主検査 records where they exist. The template is therefore
selected by `type + destination + registration status`, not by category alone.

---

# 66. Delivery Architecture

Potential:

```text
DeliveryRequest
├── inventory
├── origin                  pickup prefecture, from the item record
├── destination
├── method                  road_haulage | roro | container
├── status
├── milestones
└── tracking

  road_haulage adds:
  ├── trailer_type          low_bed | self_loader | flatbed
  ├── machine_class         selects the trailer
  ├── permit_required       特殊車両通行許可 — has a lead time
  ├── unloading             on_truck | unloaded — see §10
  └── site_access           whether a trailer can reach and turn

  sea freight adds:
  ├── vessel
  ├── voyage
  ├── etd / eta
  └── booking_reference
```

> **Revision 3.** Revision 2 modelled delivery generically. Machinery cannot deliver
> itself: a machine moves on a 低床トレーラー or セルフローダー selected by class and
> weight, and an oversized load needs 特殊車両通行許可, whose lead time changes the
> date the customer is given. For a business whose domestic side is at least as large
> as its export side, road haulage is a first-class cost line on every machine sale,
> not a shipping detail.

Quote haulage separately from the item price and label it per §10. Never fold an
unconfirmed haulage cost into a headline figure.

Only implement real tracking integrations when available.

---

# 67. Notification Architecture

Potential channels:

```text
Email
SMS
Push
Messaging
```

Start with channels the business actually needs.

Use a notification abstraction so channels can evolve independently.

---

# 68. Customer Communication

Possible structured lead states:

```text
NEW
CONTACTED
QUALIFIED
IN_PROGRESS
CONVERTED
CLOSED
```

Every enquiry additionally carries the channel it arrived on and, where the channel
is a messaging platform, an opaque thread reference — so a conversation that starts
on a listing and continues in LINE can be tied back to it. The token is generated by
the deep link in Brief §6b and consumed by `Attribution` (§5).

Use only business-approved states.

---

# 69. Data Import

If inventory is imported:

```text
Upload
↓
Validate
↓
Preview
↓
Resolve Errors
↓
Approve
↓
Import
↓
Audit
```

Never directly overwrite production inventory from an unvalidated file.

---

# 70. Data Export

Admin exports must:

- authorize the user
- limit exported fields
- audit sensitive exports
- use background processing for large datasets

---

# 71. Backup and Recovery

Production must have:

- database backups
- restore testing
- media backup strategy
- disaster recovery plan
- rollback strategy

A backup is not proven until restoration has been tested.

---

# 72. Deployment

Prefer repeatable/immutable deployments.

```text
Build
↓
Test
↓
Deploy
↓
Health Check
↓
Rollback if necessary
```

Do not deploy untested local changes directly to production.

---

# 73. Health Checks

Differentiate:

```text
process alive
```

from:

```text
ready to serve traffic
```

---

# 74. Database Migrations

Migrations must be:

- versioned
- reviewed
- tested
- reversible where practical
- safe for representative data

Never manually modify production schema without a migration record.

---

# 75. Environment Management

At minimum:

```text
local
development
staging
production
```

Never use production secrets for local development.

Provide:

```text
.env.example
```

without real credentials.

---

# 76. Observability

Monitor:

```text
Frontend errors
API errors
API latency
Database latency
Search latency
Cache hit rate
Image failures
Core Web Vitals
Conversion events
Background jobs
```

Use structured logs, metrics, and traces where appropriate.

Never log secrets or unnecessary personal information.

---

# 77. Rate Limiting

Consider rate limits for:

- contact forms
- valuation
- sourcing
- login
- account actions
- expensive searches
- AI requests

Do not make normal browsing unusably restrictive.

---

# 78. Privacy

Collect only information required for legitimate product/business purposes.

Provide appropriate privacy notices and consent mechanisms where legally required.

Legal requirements must be reviewed appropriately before production.

## Attribution data is personal data

Marketing provenance — source, campaign, referrer, landing page, click identifiers —
is innocuous in isolation and becomes personal data the moment it is joined to a
`Party`. It therefore needs a stated retention period rather than accumulating
indefinitely because it is cheap to keep.

This connects to an existing open item: ADR 0001 retains `DECLINED` seller records
permanently and flagged that the lawful basis and retention notice must be settled
before the first real seller record exists. Attribution belongs in the same decision,
not a separate one.

Retain the click identifier for as long as offline conversion reporting genuinely
needs it, and no longer. Delete on schedule, by job, not by intention.

---

# 79. Customer Lifecycle

Vehicle:

```text
BUY
↓
OWN
↓
SERVICE
↓
MAINTAIN
↓
VALUE
↓
SELL / TRADE
```

Equipment:

```text
BUY
↓
OPERATE
↓
MAINTAIN
↓
SERVICE
↓
VALUE
↓
SELL / TRADE
```

The platform should eventually support the full lifecycle.

---

# 80. Future Mobile Architecture

Future clients:

```text
Web
Mobile
AI
Partner
```

should consume the same domain/API foundation.

Do not duplicate core business rules in each client.

---

# 81. Future Partner API

Potential integrations:

- logistics
- auctions
- finance
- inspection providers
- shipping
- marketplaces

Use explicit integration boundaries.

Do not expose internal APIs directly to external partners.

---

# 82. Architecture Decision Records

For major decisions maintain ADRs:

```text
ADR-001
Title
Context
Options
Decision
Consequences
Status
```

Decided:

- ADR 0001 — lifecycle, single inventory entity, i18n model, build order
- ADR 0002 — export confirmed, settlement, attribution, catalogue depth

Still to decide:

- search engine and Japanese tokenisation
- authentication and the staff permission matrix
- CDN, object storage and the media pipeline
- AI architecture
- **payment gateway** — the domain is decided (ADR 0002); the provider is not.
  Constraints: JPY plus the currencies export quoting requires, cross-border card
  acceptance, 3-D Secure, hosted fields or hosted checkout so no card number reaches
  our systems, and webhook signature verification.
- FX rate source and staleness policy, if prices are ever displayed in a second
  currency
- export integrations, and whether logistics are in-house or through a forwarder
- 紹介料 policy and its tax treatment, before referral payout ships

---

# 83. Development Workflow

For every major feature:

```text
Understand
↓
Plan
↓
Design
↓
Implement
↓
Test
↓
Measure
↓
Review
↓
Optimize
```

Do not combine all stages into one uncontrolled coding session.

---

# 84. Claude Code Operating Mode

Claude must behave as:

```text
Principal Engineer
+
Staff Frontend Engineer
+
UX Engineer
+
Performance Engineer
+
Security Engineer
```

Claude must:

- inspect before modifying
- reason before coding
- preserve business logic
- challenge weak assumptions
- reuse existing code
- avoid unnecessary dependencies
- measure performance
- test changes
- document material decisions

---

# 85. Claude Code Stop Conditions

STOP and request clarification when:

- business rules are ambiguous
- legal claims are unclear
- payment behavior would change
- inventory truth is unclear
- API behavior conflicts with requirements
- destructive migration is required
- irreversible data change is proposed
- production credentials are required

Never guess.

---

# 86. Claude Code Anti-Patterns

Never:

- rewrite everything immediately
- replace working APIs without evidence
- invent business data
- invent business rules
- create fake production integrations
- install dozens of libraries
- duplicate components
- ignore TypeScript errors
- ignore lint failures
- ignore mobile problems
- optimize only desktop
- claim performance improvements without measurements

---

# 87. Code Quality

Prefer:

- small focused modules
- explicit types
- clear names
- predictable data flow
- testable services
- strong domain boundaries

Avoid:

- giant files
- clever abstractions
- hidden side effects
- circular dependencies
- duplicated constants
- deep unnecessary prop drilling

---

# 88. Type Safety

Prefer strict TypeScript.

Avoid:

```text
any
```

unless there is a documented reason.

Where practical, generate or centrally define API types to prevent frontend/backend drift.

---

# 89. CSS / Styling

Establish design tokens as the styling foundation:

```text
Tokens
↓
UI Components
↓
Domain Components
↓
Features
↓
Pages
```

Avoid page-specific hacks that duplicate global patterns.

---

# 90. UI Data Contracts

Normalize data before sending it to reusable cards.

Example:

```text
InventoryCardModel
├── id
├── title
├── manufacturer
├── image
├── price
├── status
├── highlights
└── badges
```

Do not make presentation components understand raw database structures.

---

# 91. React Performance

Do not blindly use:

```text
memo
useMemo
useCallback
```

Measure first.

Optimize demonstrated bottlenecks rather than adding complexity everywhere.

---

# 92. Network Performance

Reduce:

```text
request count
payload size
duplicate requests
blocking requests
```

Use:

- compression
- caching
- CDN
- responsive images
- selective prefetching

---

# 93. Critical Rendering Path

Prioritize:

```text
HTML
critical styling
primary image
primary content
```

Defer:

```text
analytics
non-critical widgets
secondary media
optional AI
deep gallery assets
```

---

# 94. Mobile Performance

Mobile receives special optimization.

Prioritize:

- first meaningful content
- first image
- price
- primary CTA
- essential specifications

Do not ship desktop-only resources to mobile unnecessarily.

---

# 95. Design Performance

Avoid expensive decorative effects:

- giant blur layers
- excessive backdrop filters
- continuous animations
- huge shadows
- unnecessary canvas effects

Premium design should remain computationally efficient.

---

# 96. Motion

Centralize motion tokens.

Respect:

```text
prefers-reduced-motion
```

Motion should communicate hierarchy and feedback, not decorate every element.

---

# 97. Core Customer Journey

The following must remain reliable:

```text
Homepage
↓
Search
↓
Inventory
↓
Detail
↓
Understand
↓
Contact
```

Optional systems must never make this path dependent on their availability.

---

# 98. 2036 Test

For every major architecture decision ask:

> If inventory becomes 100× larger, does this become a problem?

> If traffic becomes 100× larger, does this become a problem?

> If mobile and AI clients are added, does this become a problem?

> If the team doubles, can another engineer understand it?

> If the original developer leaves, can the system still be maintained?

If the answer exposes a serious weakness, improve the design.

---

# 99. 20× Engineering Questions

For every expensive feature:

```text
What is the simplest implementation?
What is the fastest implementation?
What is the most scalable implementation?
What is the most maintainable implementation?
Can we achieve all four?
```

Complexity is not automatically quality.

---

# 100. Architecture Maturity

## Stage 1 — Foundation

```text
Modular application
Database
CDN
Caching
```

## Stage 2 — Growth

```text
Background workers
Search optimization
Media pipeline
Customer accounts
```

## Stage 3 — Intelligence

```text
Dedicated search
Recommendations
AI services
External integrations
```

## Stage 4 — Ecosystem

```text
High-scale services where justified
Global delivery
Advanced AI
Mobile ecosystem
```

Progress only when real requirements justify the next stage.

---

# 101. Final Architecture

```text
                     CUSTOMER EXPERIENCE
                              |
                 +------------+------------+
                 |                         |
              WEBSITE                 FUTURE APPS
                 |                         |
                 +------------+------------+
                              |
                         DOMAIN API
                              |
      +------------+----------+----------+------------+
      |            |                     |            |
  Inventory     Search              Customers    Operations
      |            |                     |            |
      +------------+----------+----------+------------+
                              |
                    PRIMARY DATA STORE
                              |
             +----------------+----------------+
             |                |                |
           Cache            Media            Search
             |                |                |
             +----------------+----------------+
                              |
                       Background Jobs
                              |
             +----------------+----------------+
             |                |                |
            AI          Notifications    Integrations
```

Keep the architecture simple until evidence requires additional infrastructure.

---

# 102. Non-Negotiable Rules

1. Read the ADRs before changing anything — `0001-lifecycle-and-scope.md`, then
   `0002-commerce-capabilities.md`. They supersede earlier revisions of all three
   documents; where an ADR conflicts with a document, the ADR wins.
2. Preserve working business logic.
3. Never invent business data.
4. Never invent legal claims.
5. English + Japanese only.
6. Server-first where appropriate.
7. Minimize JavaScript.
8. Optimize images aggressively.
9. Avoid N+1 database queries.
10. Do not load unnecessary data.
11. Do not add dependencies without justification.
12. Test critical workflows.
13. Measure performance.
14. Design for mobile.
15. Design for accessibility.
16. Keep domain boundaries clear.
17. Prefer modular monolith before microservices.
18. Make optional systems fail safely.
19. Keep the database authoritative.
20. Build extension points for the next decade.

---

# 103. Relationship to Other Project Documents

```text
MAS_SONS_MASTER_DESIGN_BRIEF.md
        |
        | Product / UX / Business Vision
        v
MAS_SONS_PROJECT_ARCHITECTURE.md
        |
        | Technical Architecture
        v
MAS_SONS_IMPLEMENTATION_PLAN.md
        |
        | Execution Plan
        v
Production Application
```

Keep all three documents aligned.

When implementation reality changes, update the architecture and implementation plan.

---

# 104. Final Directive to Claude Code

Do not interpret this document as an instruction to immediately create hundreds of
files.

Build only what the current milestone requires, and read §32 of the Implementation
Plan for what that is.

Create the smallest strong architecture capable of supporting the complete M.A.S &
SONS product vision.

Build for:

**2026 today.**

**2030 growth.**

**2036 resilience.**

Use the engineering mindset:

# BUILD LESS. LOAD LESS. QUERY LESS. RENDER LESS. WASTE LESS.

while delivering:

# MORE QUALITY. MORE SPEED. MORE CLARITY. MORE TRUST. MORE CAPABILITY.
