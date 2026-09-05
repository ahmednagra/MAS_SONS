# M.A.S & SONS 株式会社 — MASTER DESIGN BRIEF

## Next-Generation Japanese Automotive & Heavy Equipment Digital Platform
### Product, UX, UI, Performance & Architecture Vision — 2026 → 2036

---

## 0. DOCUMENT STATUS — REVISION 3 (2026-09-04)

Revision 3 follows a direct reading of the supplied business card and the client's
confirmation of export, online payment and referral commission.
See `docs/decisions/0002-commerce-capabilities.md`.

Changes in Revision 3:

- Export is confirmed. The §14 capability gate and the §76 hedge are removed.
- §32 gains a delivery-term axis; §32b adds settlement and payment methods.
- §6b gains the LINE enquiry deep link, which ships at M5 rather than M9.
- §58b adds attribution and referral. §80b adds three buying-process guides.
- §19 and §20 gain equipment facets and a category-resolved sort specification.
- §42b adds domestic delivery and heavy haulage.
- §2 records three corrections to the transcribed card material, pending
  verification. §45 becomes conditional on whether a visitable yard exists.

Changes in Revision 2 (2026-09-03), after review against the supplied company
material (business card / licence artwork):

- Acquisition (買取) is modelled as a first-class front door, not a late-phase
  feature. See §4a and §87.
- `VehicleCard` / `EquipmentCard` and their parallel component trees collapse into
  a single `InventoryCard`. See §10 and Architecture §6.
- The §11 palette was replaced. The warm-ivory / vermilion direction contradicted
  §8 and reads as a generic template.
- Legal display obligations (§2b) and inbound channels including LINE (§6b) were
  added. Both were absent.
- The project is greenfield. There is no repository to audit.

Rationale for each change: `docs/decisions/0001-lifecycle-and-scope.md` and
`docs/decisions/0002-commerce-capabilities.md`.
Do not silently revert to earlier behaviour.

---

## 1. EXECUTIVE DIRECTIVE

Build M.A.S & SONS as a premium, high-performance digital platform — not a conventional used-car dealership website.

The product must combine:

- Japanese premium design discipline
- Automotive showroom quality
- Marketplace-grade discovery
- Heavy-equipment technical clarity
- High-conversion commerce UX
- International customer usability
- Enterprise-grade scalability
- Extremely fast performance
- AI-ready structured data
- Long-term maintainability

### 20× PERFORMANCE MINDSET

“20× performance” is an engineering ambition, not an unverified promise that every page will literally be 20× faster than every competitor.

Treat it as a mandate to aggressively eliminate:

- unnecessary network requests
- excessive JavaScript
- unnecessary hydration
- oversized images
- duplicated API calls
- inefficient database queries
- N+1 queries
- unnecessary rendering
- expensive client-side computation
- redundant dependencies
- blocking third-party scripts
- operational bottlenecks

Every major feature must be measurable against performance budgets.

The target is a website that feels exceptionally fast even as inventory, traffic, media, and functionality grow.

---

# 2. BUSINESS IDENTITY — TRANSCRIBED, PENDING VERIFICATION

The supplied licence/registration artwork is the primary business identity reference.

**Nothing in this section is verified.** It is transcribed from supplied artwork and
must be confirmed with the company before production launch — see §46. Treat every
value below as unconfirmed input, not ground truth.

**Company:** M.A.S & SONS 株式会社

**古物商許可番号:** 第 401210001551

**Representative Director:** アリワシーム

**Mobile:** 08092709540

**Tel/Fax:** 0296-48-6450

**Email:** massonsjpn@gmail.com

**Address:**

茨城県下妻市福田2175番地2  
ローズナミキ1号棟102号室

The supplied material communicates:

- Used automobile sales
- Used automobile purchasing
- High-value purchasing regardless of vehicle year
- Excavators
- Wheel loaders / tire shovels
- Bulldozers
- Tractors
- Crane trucks / crane vehicles
- Trailers
- 1t / 2t / 4t / 10t dump trucks
- Trucks
- Other construction, agricultural, and commercial machinery

The supplied material includes:

> 年式に関係なく高価買取いたします。

### Corrections pending verification

Reading the supplied artwork directly raised three items. None has been silently
corrected — this is licence-adjacent material and §86 governs.

- The card prints 「タイヤシャワー」. No such machine exists; it is almost certainly
  「タイヤショベル」 (wheel loader), which is how the list above reads it.
- 「クレーン車」 appears twice in the machinery list. Likely a printing duplication.
- The address ローズナミキ1号棟102号室 is an apartment room. That is a plausible
  registered 営業所, but there is no evidence of a visitable yard or showroom at it.
  See §6b and §45.

The card is written entirely in Japanese and makes no reference to export, English,
destinations or shipping. **Export is confirmed by the client, not by this artifact**
(ADR 0002). Keep the two sources of truth distinguishable.

Do not invent additional licences, certifications, services, warranties, financing products, or legal claims.

---

# 2b. LEGAL DISPLAY OBLIGATIONS

The company holds an 古物商 (antique dealer) licence, which carries display
requirements for dealers operating online. Transactional pages may additionally
fall under 特定商取引法.

At minimum, plan for a persistent, crawlable display of:

- 古物商許可番号 and the issuing public safety commission
- registered trade name and representative
- registered address and contact
- the seller-information disclosure required for any transactional flow

### 特定商取引法 — triggered by publishing payment methods

The moment prices and payment methods are published (§32b), 通信販売 disclosure
applies. Plan a dedicated, crawlable 特定商取引法に基づく表記 page carrying at least:

```text
事業者名（名称）
代表者名 または 通信販売業務責任者名
所在地
電話番号
メールアドレス
販売価格 と 価格に含まれるもの
代金の支払方法        すべての方法を列挙する
代金の支払時期        前払の場合は省略できない
引渡時期              役務・商品の提供時期
返品特約              可否・期間・条件・送料負担
```

This page is the customer-facing face of §32b and §42. It is a **blocker on the
payments work specifically**, not a general footer task.

**Verify the exact required set with someone qualified in Japan before launch.**
Do not infer these obligations from this document, and do not fabricate the
issuing authority — it is not present in the supplied material.

Treat this as a launch blocker, not a footer detail.

---

# 3. BRAND RESET

This is a new digital product direction for M.A.S & SONS.

The old website may be used as a functional reference only where it represents real business operations.

Do not carry its outdated visual language into the new platform.

The new product must establish an original identity.

### Positioning

> Premium Japanese Automotive & Equipment Platform

The experience should communicate:

**Japanese origin + real inventory + technical credibility + modern commerce + trustworthy service.**

---

# 4. PRODUCT NORTH STAR

Do not think:

> “Build a website that displays cars.”

Think:

> “Build the digital operating front door for M.A.S & SONS.”

There are two front doors, not one.

## 4a. Acquisition — the primary front door

The supplied company material leads with 買取, in red: 年式に関係なく高価買取いたします。
A seller with a machine to sell is the highest-frequency inbound contact, and the
valuation produced in response is the highest-value record the business creates.

```text
SELLER CONTACT   (LINE / phone / web / walk-in)
↓
INTAKE
↓
VALUATION
↓
OFFER
↓
DECLINED   |   PURCHASED
↓
COLLECTION
↓
PREPARATION
↓
STOCK
```

Declined offers are retained permanently. Over time this produces the one dataset
the business cannot buy elsewhere: what it was offered, what it paid, and what the
item later sold for. Any future valuation assistance depends on it existing.

## 4b. Sales — the second front door

The complete customer lifecycle:

```text
DISCOVER
↓
SEARCH
↓
FILTER
↓
COMPARE
↓
UNDERSTAND
↓
TRUST
↓
INQUIRE
↓
RESERVE / BUY
↓
PREPARE
↓
DELIVER / EXPORT
↓
OWN / OPERATE
↓
SERVICE
↓
VALUE
↓
SELL / TRADE
↓
BUY AGAIN
```

For equipment:

```text
DISCOVER
↓
SEARCH
↓
TECHNICAL EVALUATION
↓
INSPECTION
↓
QUOTE
↓
PURCHASE
↓
TRANSPORT / DELIVERY
↓
OWN / OPERATE
```

---

# 5. BUSINESS WORLDS

## VEHICLES

Potential categories:

- Passenger cars
- Used cars
- New cars
- Hybrid vehicles
- EVs
- SUVs
- Vans
- Family vehicles
- Premium vehicles
- JDM / enthusiast vehicles
- Commercial vehicles
- Trucks

Only expose categories supported by real inventory.

## HEAVY EQUIPMENT & MACHINERY

Based on the supplied business material:

- Excavators
- Wheel loaders / tire shovels
- Bulldozers
- Tractors
- Crane trucks
- Crane vehicles
- Dump trucks
- Trucks
- Trailers
- Other machinery

The domain model must allow additional categories without a redesign.

---

# 6. PRIMARY CUSTOMER INTENTS

Organize the product around customer intent.

### BUY
Find and purchase a vehicle or machine.

### SELL / TRADE
Sell an existing vehicle or eligible equipment.

### SOURCE
Request an item not currently in inventory.

### EXPORT / DELIVERY
Where operationally supported, manage transportation/export requirements.

### COMPANY
Understand the company, location, people, and trust information.

### MY M.A.S & SONS
Saved items, inquiries, documents, appointments, and transaction status.

---

# 6b. INBOUND CHANNELS

Intent arrives through channels, and the channel shapes the interface.

```text
LINE        primary for Japanese sellers; the card carries a LINE QR
Phone       0296-48-6450 / 08092709540; the card promises 24時間受付
Website     both languages
Walk-in     Shimotsuma
```

Consequences for the product:

- A web form is not the primary intake path. Most acquisitions will begin as an
  unstructured LINE or phone conversation. The system's job is to let staff
  structure that conversation quickly, not to insist sellers fill in a form.
- Every unit record carries its origin channel. Channel mix is the input to any
  later decision about where to spend acquisition effort.
- 24-hour reception is a promise made in print. Design for messages arriving at
  23:00 and being triaged the next morning without loss.

### The LINE enquiry link is a URL, not an integration

A deep link opens a LINE chat with the message box already filled:

```text
https://line.me/R/oaMessage/{percent-encoded @id}/?{percent-encoded text}
```

Because it is only a URL, it **ships with the public catalogue at M5** — it does not
wait for the Messaging API at M9. Without it, M5 through M8 would publish a catalogue
with no messaging path at all, while the business card promises 24時間受付.

Two surfaces need it:

- **Buyer** — on every stock item, pre-filled with the reference number and title.
- **Seller** — on the 買取 pages, pre-filled with a short intake prompt.

Requirements:

- The pre-filled text carries an opaque token so the resulting conversation can be
  attributed back to the page it started from. See §58b.
- The scheme resolves only on LINE for iOS and Android. Desktop needs a fallback —
  the QR code plus a selectable account ID, never a dead link.
- Percent-encode the account ID (including the `@`) and the message text in UTF-8.
- The LINE Official Account ID is **not yet known** — the business card carries only
  a QR image. It is an open question in Phase 0 and a prerequisite for this feature.

Do not build the Messaging API integration in the first phases. Do record the channel
from day one — retrofitting it means the field is empty for every historical record.

---

# 7. DESIGN NORTH STAR

The interface must feel:

- Premium
- Japanese
- Precise
- Calm
- Confident
- Modern
- Human
- International
- Technically credible
- Extremely fast

It must not feel like:

- A cheap classifieds site
- A generic WordPress dealership
- A SaaS dashboard
- A dropshipping store
- A template assembled from unrelated components

---

# 8. JAPANESE DESIGN PHILOSOPHY

Use Japanese design through discipline rather than decoration.

### Ma
Intentional whitespace.

### Kanso
Simplicity and removal of unnecessary elements.

### Seijaku
Quiet, controlled visual energy.

### Precision
Strong alignment, typography, hierarchy, and detail.

### Authenticity
Real vehicles, real machinery, real business information.

Avoid cliché Japanese decoration:

- Sakura everywhere
- Random Kanji
- Samurai imagery
- Excessive Japanese flags
- Decorative red everywhere
- Artificial “Japan” motifs

The site should feel Japanese because of its quality and restraint.

---

# 9. VISUAL DIRECTION

Combine:

### Japanese premium brand
- Editorial layouts
- Controlled whitespace
- High-quality photography
- Strong typography
- Minimal visual noise

### Automotive showroom
- Large vehicle imagery
- Cinematic presentation
- Strong product identity
- Gallery-first detail pages

### Marketplace
- Search
- Filters
- Comparison
- Favorites
- Inventory intelligence
- Clear pricing

### Industrial equipment platform
- Technical specifications
- Operating data
- Condition
- Attachments
- Inspection
- Documentation

---

# 10. DESIGN SYSTEM

Build the design system from real screens, not ahead of them.

The list below is a catalogue of components the platform may eventually need. It is
**not** a phase-one deliverable. Roughly 35 components against ten states each is
~350 speculative permutations authored before a single page exists, and most will be
wrong because no real content has tested them.

Rule: a component enters the system on its **second** use. Before that it lives in
the screen that needs it.

Realistic first set: `Button`, `Input`, `Select`, `Badge`, `InventoryCard`,
`Gallery`, `FilterPanel`, `Dialog`, `EmptyState`, `Skeleton`.

Eventual catalogue:

```text
Header
Navigation
Hero
UnifiedSearch
InventorySearch
InventoryCard
FilterPanel
SortControl
PriceDisplay
TrustBadge
FavoriteButton
CompareButton
Gallery
VideoViewer
360Viewer
Specifications
ConditionPanel
InspectionPanel
DocumentViewer
InquiryForm
ValuationForm
SourcingForm
ExportQuote
Timeline
Garage
Showroom
Reviews
FAQ
Footer
Modal
Drawer
Toast
Skeleton
EmptyState
ErrorState
```

Vehicles and equipment share one card, one gallery, one detail template, and one
specification renderer. They differ in which specification schema is applied, not in
which components render them. See Architecture §6, §7, §8.

Every interactive component must support:

```text
default
hover
focus
active
selected
disabled
loading
empty
error
success
```

---

# 11. VISUAL TOKENS

Recommended starting palette:

```text
Ink              #0F1B2A
Paper            #FFFFFF
Surface          #F1F4F7
Border           #D7DEE6
Muted Text       #6B7C8F
Signal Blue      #1D4ED8
Confirm Green    #047857
Caution Amber    #B45309
Alert Red        #B91C1C
```

Accent colors should be restrained. Blue carries primary actions and links, green
confirms, amber marks attention, red marks failure. Nothing else earns a colour.

**Why the previous palette was replaced.** Revision 1 recommended Warm Ivory
`#F7F6F2` with Deep Vermilion `#B43A2F`. A cream ground with a warm-red accent is
currently the default output of AI design tooling and reads as templated — which §7
explicitly prohibits. It also contradicted §8, which forbids decorative red. The
palette above is derived from the subject: machinery, steel, and the cool grey of a
working yard, with colour reserved for state rather than decoration.

Premium quality should come primarily from:

- Typography
- Photography
- Spacing
- Contrast
- Composition
- Motion

---

# 12. TYPOGRAPHY

Japanese:

- Noto Sans JP

English:

- A grotesque with true tabular numerals and a technical register.
- Inter and Geist are acceptable only if chosen against alternatives. Reaching for
  them by default produces the same page as every other project.

Latin and Japanese glyphs appear in the same line constantly (`コマツ PC138US-11`).
Set a single stack with the Latin face first and Noto Sans JP as fallback, so each
script is drawn by the face designed for it. Do not switch fonts by language.

Operating hours, mileage, prices, and reference numbers must use tabular numerals.
Columns of figures that fail to align read as amateur in a technical catalogue.

Typography must be:

- Highly readable
- Modern
- Precise
- Premium
- Responsive

Avoid decorative fonts.

---

# 13. SPACING & SHAPE

Use:

```text
4
8
12
16
24
32
48
64
96
128
```

Suggested starting radius:

```text
Cards: 8px
Buttons: 6px
Inputs: 6px
Images: 4–8px
```

Avoid excessive rounded “SaaS bubble” styling.

---

# 14. NAVIGATION

Recommended desktop structure:

```text
LOGO

STOCK                    # one catalogue; category is a filter
買取 / SELL
EXPORT                   # from M7 — see the table below
ABOUT

EN / 日本語
CONTACT
```

Footer carries the legal group: 特定商取引法に基づく表記, 古物商 details, privacy,
terms, and bank/payment information. See §2b and §32b.

Expand only as the capability behind each entry actually ships:

| Entry | Requires | Milestone |
|---|---|---|
| EXPORT | the export pages themselves — the *capability* is confirmed, the *pages* land at M7 | M7 |
| SOURCE | verified auction/sourcing capability | M16, post-launch |
| FAVORITES | favourites implemented | M14, post-launch |

The final hierarchy should be validated during UX exploration.

> **Revision 2.** `VEHICLES` and `EQUIPMENT` were merged — they are one catalogue
> with a category facet, and a split navigation contradicts the single route family
> at `/stock/[slug]`. `SOURCE`, `EXPORT / DELIVERY` and `FAVORITES` were moved behind
> capability gates: §87 defers all three to 2027 or post-launch, while §76 listed
> "Submit Sourcing Request" and "Request Export Quote" as dominant page actions —
> and this document forbids exposing actions the business does not support, and
> forbids inventing export capability. Navigation to an unbuilt destination is the
> most visible form of that error.

> **Revision 3.** The `EXPORT / DELIVERY` entry is no longer gated on *whether the
> business exports* — it does (ADR 0002 Decision 1) — so §42 becomes an active
> specification and §76 no longer hedges "Request Export Quote". It is still gated on
> *whether the pages exist*: the global shell ships at M4 and the export pages at M7,
> and navigation to an unbuilt destination is the error Revision 2 removed. Show the
> entry from M7. `SOURCE` and `FAVORITES` remain gated for unchanged reasons.
>
> A confirmed capability is also not a confirmed destination list. §42 must not
> publish countries the business cannot service.

---

# 15. HOMEPAGE

The homepage should immediately communicate:

1. Japanese origin
2. Vehicles
3. Heavy equipment
4. Trust
5. Search
6. Clear next action

Hero concept:

> JAPANESE VEHICLES. REAL MACHINES.

Possible CTAs:

- Explore Vehicles
- Explore Equipment
- Sell to Us

Do not finalize claims without business approval.

---

# 16. HOMEPAGE STRUCTURE

Recommended:

```text
Hero
↓
Universal Search
↓
Featured Vehicles
↓
Featured Equipment
↓
Categories
↓
Why M.A.S & SONS
↓
How It Works
↓
Sell / Trade
↓
Source From Japan
↓
Export / Delivery
↓
Showroom
↓
Customer Trust
↓
Journal / Guides
↓
Contact
↓
Footer
```

This is a strategic structure, not a rigid pixel specification.

---

# 17. UNIVERSAL SEARCH

The long-term search should support both vehicles and equipment.

Examples:

> Toyota Land Cruiser under ¥5 million

> 20 ton excavator under ¥8 million

Natural-language search should resolve to structured criteria.

If exact results do not exist:

> We found 4 close matches.

Explain which criteria differ.

Never fabricate inventory.

---

# 18. VEHICLE SEARCH

> **Revision 2.** §18 and §19 define two *facet sets*, not two search systems. One
> index, one results page, one URL scheme; the facets shown are selected by the
> active category. See Architecture §15.

Core:

- Make
- Model
- Price
- Year

Advanced:

- Mileage
- Body type
- Fuel
- Transmission
- Drive
- Engine
- Color
- Seats
- Condition
- Location
- Availability

Japan-specific filters should only appear when supported by real data.

---

# 19. EQUIPMENT SEARCH

> **Revision 2.** §18 and §19 define two *facet sets*, not two search systems. One
> index, one results page, one URL scheme; the facets shown are selected by the
> active category. See Architecture §15.

Potential filters:

- Category
- Manufacturer
- Model
- Year
- Price
- Operating hours
- Condition
- Operating weight
- Engine
- Power
- Location
- Attachment
- Availability

### Facets buyers of Japanese machinery actually use

The list above is the generic set. A survey of the leading Japanese used-equipment
marketplaces shows buyers select on considerably more, and a machine that cannot be
filtered on these is effectively invisible:

```text
Weight class          banded, not raw — 6~9t / 10~17t / 18~25t / 26t以上
Auxiliary hydraulics  配管付 / 併用配管付 — decides whether a breaker can be fitted
Arm and boom          標準 / オフセット / スライドアーム / スーパーロング /
                      ショートリーチ / 解体機仕様
Undercarriage         ゴムキャタ / 鉄キャタ / パッド付 / 湿地シュー, plus shoe width
Crane specification   capacity, boom sections, jib — for クレーン仕様 and crane trucks
排出ガス規制対応       which emission generation the machine meets
購入可能エリア         domestic only / overseas eligible
Pickup location       prefecture — the input to a haulage quote, see §42b
```

Two notes on why these specific fields:

- **Weight is banded, not numeric.** Buyers shop by class, not by kilogram. Offer the
  band as the facet and keep the exact `operating_weight` on the record.
- **排出ガス規制対応 is legally load-bearing.** It governs which machines may operate
  on Japanese public-works sites, so it is the first question a contractor asks. It is
  absent even from the leading Japanese marketplace, which makes it a differentiator
  rather than table stakes.

Do not expose unsupported filters. Every field above is subject to §86 — if the data
is not held, the facet does not appear.

---

# 20. INVENTORY PAGE

Inventory is the core discovery experience.

Example:

```text
Vehicles
{count} available
```

or:

```text
Equipment
{count} available
```

Support:

- Search
- Filters
- Sort
- Grid/List
- Pagination or efficient cursor-based loading
- Future map view

### Sort orders

Sorting resolves from the active category, exactly as facets do. Mileage ordering is
meaningless on an excavator; operating-hours ordering is meaningless on a passenger
car. One results page, one URL scheme, a category-selected sort set.

```text
Both categories      Newest listed          default
                     Price low → high
                     Price high → low
                     Year new → old
                     Year old → new
                     Recently reduced       only where sale_price is set
                     Most enquired          demand signal, see §58b
                     Reference number

Vehicles only        Mileage low → high
                     Mileage high → low

Equipment only       Operating hours low → high
                     Operating hours high → low
```

Three requirements, each a defect if omitted:

- **The active sort appears in the URL** (§21), so a sorted result is shareable.
- **Every sort has a deterministic tiebreaker.** Without one, pagination silently
  duplicates and drops records between pages — two items with the same price have no
  stable order, and the database is free to return them differently each query.
- **NULL placement is explicit.** An item with no recorded operating hours must not
  surface at the top of "hours, low to high". Unknown is not zero.

Do not render hundreds or thousands of cards unnecessarily.

---

# 21. URL-DRIVEN SEARCH

Search state should be represented in URLs.

Example:

```text
/inventory?category=vehicles&make=Toyota&model=Crown&year_min=2023
```

Benefits:

- Shareable searches
- Browser history
- SEO
- Analytics
- Saved searches
- Server-side filtering
- Caching

---

# 22. VEHICLE CARD

> **Revision 2.** §22 and §23 define two *field sets* rendered by one
> `InventoryCard`. Which fields appear is resolved from `category`. Do not build two
> card components. See Architecture §6.

Recommended structure:

> **Illustrative layout only — not data.** Every value below is invented. It must
> never be seeded into a database, a fixture, a staging site or a screenshot.
> See §86.

```text
[Large Image]

{maker}

{model} {variant}

{model_year} · {mileage_km} km
{fuel_type} · {transmission} · {drive_type}

{price}

{trust_badge — only if factually earned}

♡ Save

View details
```

Show decision-critical information only.

---

# 23. EQUIPMENT CARD

> **Revision 2.** §22 and §23 define two *field sets* rendered by one
> `InventoryCard`. Which fields appear is resolved from `category`. Do not build two
> card components. See Architecture §6.

Recommended:

```text
[Large Image]

{maker}

{model}

{model_year} · {operating_hours} hours

{operating_weight} class
{fuel_type}

{price}

{trust_badge — only if factually earned}

♡ Save

View details
```

Only display data actually available.

---

# 24. VEHICLE DETAIL PAGE

> **Revision 2.** §24 and §25 describe one detail template at `/stock/[slug]` with a
> category-selected specification schema. The above-the-fold content differs; the
> page, gallery, enquiry path, and layout do not. See Architecture §6, §22.

The detail page is a digital showroom.

Above the fold:

```text
{maker} {model} {variant}

{model_year}
{mileage_km} km
{fuel_type} · {transmission} · {drive_type}

{price}

[Contact]
[Reserve — only where the reservation workflow exists]

♡ Save
```

Then:

- Gallery
- Specifications
- Condition
- Inspection
- Features
- Documents
- Purchase information
- Delivery/export
- Seller/showroom
- Similar inventory

---

# 25. EQUIPMENT DETAIL PAGE

> **Revision 2.** §24 and §25 describe one detail template at `/stock/[slug]` with a
> category-selected specification schema. The above-the-fold content differs; the
> page, gallery, enquiry path, and layout do not. See Architecture §6, §22.

Above the fold:

```text
{maker} {model}

{model_year}
{operating_hours} operating hours
{operating_weight} class

{price}

[Request Information]

♡ Save
```

Then:

- Technical specifications
- Dimensions
- Operating information
- Condition
- Attachments
- Maintenance
- Inspection
- Documents
- Delivery
- Similar equipment

---

# 26. MEDIA SYSTEM

Vehicle media may include:

- Exterior
- Interior
- Dashboard
- Rear
- Wheels
- Engine
- Boot
- Seats
- Undercarriage
- Inspection
- Auction sheet
- Documents
- 360°
- Video

Equipment media may include:

- Front
- Rear
- Side
- Operator cabin
- Engine
- Undercarriage
- Attachments
- Hydraulic system
- Hour meter
- Identification plate
- Condition
- Documents
- Video

Only render sections when media exists.

---

# 27. MEDIA PERFORMANCE

Media must never become a performance bottleneck.

Use:

- AVIF/WebP
- Responsive `srcset`
- Correct image sizing
- CDN
- Lazy loading
- LQIP/blur placeholders
- Priority loading only for LCP media
- Progressive gallery loading
- Video poster images
- Deferred video loading
- Explicit dimensions

Do not download the complete gallery before the user requests it.

---

# 28. 360° / IMMERSIVE MEDIA

Architecture should support:

- 360° images
- Interactive walkarounds
- Video
- High-resolution zoom
- Future 3D
- Future AR

These are progressive enhancements.

---

# 29. STRUCTURED SPECIFICATIONS

Vehicle:

```text
Year
Mileage
Engine
Fuel
Transmission
Drive
Body Type
Seats
Color
```

Equipment:

```text
Manufacturer
Model
Year
Operating Hours
Operating Weight
Engine
Power
Fuel
Dimensions
Attachment
Drive
Condition
Location
```

Use category-aware schemas.

---

# 30. CONDITION SYSTEM

Vehicle:

- Exterior
- Interior
- Mechanical
- Accident history
- Repair history
- Smoking
- Pet use
- Engine
- Transmission

Equipment:

- Body
- Engine
- Hydraulics
- Undercarriage
- Cabin
- Attachments
- Operating condition
- Maintenance
- Damage

Only show verified information.

---

# 31. TRUST SYSTEM

Potential evidence-based badges:

- Inspected
- Documents available
- Auction sheet available
- Verified
- Warranty available
- Maintenance records available
- Export ready

A badge is a factual claim. Never use decorative trust badges.

---

# 32. PRICE SYSTEM

Clearly distinguish:

### Confirmed price
Authoritative business price.

### Estimated
Approximate calculation.

### Quote required
Requires manual confirmation.

Never present uncertain shipping, taxes, duties, customs, transport, or export charges as final prices.

## Delivery terms — a second, independent axis

Price status answers *how certain is this number*. Delivery term answers *what does
it include and where does it end*. They are orthogonal and both must be shown.

```text
Domestic        店頭渡し          buyer collects from us
                納車渡し          we deliver to the buyer
                車上渡し          delivered on the truck; buyer unloads
                荷卸し込み        delivered and unloaded

Export          EXW · FOB · CFR · CIF · other Incoterms 2020 codes as required
```

Three rules the model enforces, not merely documents:

1. **The term is `CFR`.** The ampersand form that reference exporters still print was
   retired from the ICC rules; `CNF` survives only because early SWIFT systems could
   not carry an ampersand. Storing the retired form embeds a dead code in a reference
   table that becomes expensive to change once records point at it.
2. **`CFR` and `CIF` cover sea and inland-waterway carriage only.** They cannot be
   attached to a machine sold ex-yard or moved by road. The available terms are
   constrained by carriage mode, or the model permits quotes that mean nothing.
3. **車上渡し versus 荷卸し込み is not a detail on heavy machinery.** Who unloads a
   20-tonne excavator is a material cost and a safety question. See §42b.

The Incoterms rules are ICC copyright. Reference the codes; write every
customer-facing explanation in our own words.

Alongside the term, state **what the price includes** — vehicle, inland transport,
inspection, documents, freight, insurance — as structured data rather than prose, so
the same record drives the listing, the quotation and the invoice.

---

# 32b. SETTLEMENT & PAYMENT

> **Revision 3.** Payments existed nowhere in Revision 2 except as a bullet in
> Architecture §82's list of ADRs someone should eventually write — while §24 already
> offered a Reserve action and Architecture §9 already carried a `RESERVED` state.
> ADR 0002 Decision 3 makes it a domain.

### The ledger is the product; methods are interchangeable

What the business needs is a record of *what is owed, against which deal, and what
has arrived*. Money reaches it by several routes and more will be added:

```text
銀行振込              domestic, dominant
Telegraphic transfer  export, dominant
Card                  online, all values — client decision
JUMVEA Safe Trade     export escrow, if membership is taken
```

Model the ledger method-agnostically. A design in which card processing is
load-bearing would be built around the exception, because this trade settles
overwhelmingly by transfer.

### Card acceptance

In scope by business decision, with the trade-off recorded rather than argued: card
fees on vehicle-value transactions are material, and cross-border chargebacks on
high-value goods are a real exposure. Three consequences are therefore not optional:

- **Card data never touches our systems.** Hosted fields or hosted checkout only. No
  card number at rest, none in logs, none in support tooling.
- **3-D Secure is mandatory** on cross-border capture.
- **Every write is idempotent under retry**, so a repeated callback cannot double a
  payment or a refund.

### Published bank details are a fraud target

The account details page is load-bearing trust content and the single most attacked
surface on a site like this — payment diversion works by supplying different details
by email. Therefore:

- Hold the values as **structured reference data with an audit trail**, not as body
  text an editor can quietly change.
- Publish domestic and export blocks separately: domestic needs 金融機関名, 支店名,
  預金種目, 口座番号 and 口座名義 including カナ; export needs beneficiary name and
  address, bank name and address, SWIFT/BIC, account or IBAN, and any intermediary
  bank.
- State **who bears the transfer charges** (`OUR` / `SHA` / `BEN`). This is the single
  most common cause of a short payment arriving.
- Carry a standing notice that bank details are never changed by email or message,
  and that the published page is the only authority.

The actual account values are **not recorded anywhere in this corpus** and must be
supplied and verified by the company before launch, exactly as §47 handles the
telephone numbers.

### Legal consequence

Publishing prices and payment methods triggers 特定商取引法 通信販売 disclosure.
See §2b — that page is a blocker on this work specifically.

---

# 33. COMPARISON

Vehicle comparison:

```text
                     Vehicle A    Vehicle B

Price
Year
Mileage
Engine
Fuel
Transmission
Drive
Condition
Features
```

Equipment comparison:

```text
Price
Year
Operating Hours
Weight
Engine
Power
Dimensions
Condition
Attachments
```

Mobile comparison must remain usable.

---

# 34. FAVORITES / GARAGE

Long-term concept:

# My Garage

Users can:

- Save vehicles
- Save equipment
- Compare
- Save searches
- Track availability
- Receive price alerts
- Receive matching inventory alerts

Do not force registration for ordinary browsing.

---

# 35. AI CONCIERGE

Future:

# M.A.S. Concierge

Capabilities:

- Search inventory
- Explain specifications
- Compare items
- Recommend suitable inventory
- Translate information
- Explain buying processes
- Explain export processes
- Assist sourcing requests

Hard rule:

> AI may reason over verified platform data but must never invent inventory facts.

Never fabricate:

- Price
- Availability
- Mileage
- Operating hours
- Condition
- Warranty
- Inspection
- Shipping
- Legal claims

---

# 36. “WHY THIS ITEM?”

Future recommendation explanation:

```text
Why this vehicle may suit you

✓ Within your budget
✓ Matches requested body type
✓ Lower mileage than alternatives
✓ Hybrid
```

For equipment:

```text
Why this machine may suit you

✓ Matches requested weight class
✓ Within budget
✓ Suitable attachment
✓ Competitive operating hours
```

Every explanation must derive from actual data and explicit user preferences.

---

# 37. SELL YOUR VEHICLE

The supplied business material explicitly supports vehicle purchasing.

Flow:

```text
Vehicle
↓
Condition
↓
Photos
↓
Documents
↓
Contact
↓
Valuation Request
```

### 出張査定 — on-site appraisal is the primary mechanic, not an option

An excavator cannot be driven to an office, and it is not yet established that a
visitable yard exists at all (§2, §45). For the machinery half of the business,
on-site appraisal is how acquisition actually happens.

Booking must capture location and access, a scheduled window, and the assigned
appraiser — and it must survive the 24時間受付 promise, meaning a request left at
23:00 is triaged the next morning without loss.

```text
Where            address, site access, whether the machine can be started/moved
When             preferred windows, not a single fixed slot
Who              assigned appraiser, recorded on the unit
What             category, maker, model, year, hours or mileage, condition notes
```

### 概算査定 — an estimate before personal details

Every competitive 買取 service returns an indicative figure from about five fields
**before** asking who the seller is, and publishes a public 相場 range by model.
Requiring a name and telephone number first is the largest avoidable drop-off in this
funnel.

Gated on data, not on effort: the estimate is only credible once the offer, purchase
and sale prices recorded from the first day (ADR 0001 Decision 1) have accumulated.
Label it an estimate, never a quotation.

**There is no equivalent 相場 service for construction machinery anywhere in the
market.** For the equipment half of the business this is the strongest differentiator
available, and it is a by-product of a record the business is keeping anyway.

Future AI-assisted preliminary valuation may be added, clearly labelled as an
estimate, and must obey §86.

---

# 38. SELL YOUR EQUIPMENT

Because the supplied material also covers machinery purchasing:

Potential categories:

- Excavator
- Wheel loader
- Bulldozer
- Tractor
- Truck
- Crane vehicle
- Trailer
- Dump truck
- Other machinery

The form should dynamically adapt to equipment type.

---

# 39. TRADE-IN

Where confirmed:

```text
Current Item
+
Desired Item
=
Trade-In Request
```

Keep this modular until the business workflow is confirmed.

---

# 40. SOURCE FROM JAPAN

Customers should be able to request items not currently in inventory.

Example:

```text
Toyota Land Cruiser
2021+
Under ¥6M
Low mileage
Black
```

Equipment:

```text
20-ton excavator
Under ¥8M
Low operating hours
Good condition
```

Workflow:

```text
Request
↓
Sourcing
↓
Candidate
↓
Inspection
↓
Quote
↓
Approval
↓
Purchase
↓
Preparation
↓
Delivery / Export
```

---

# 41. JAPANESE AUCTION SOURCING

Future capability only if operationally supported.

Potential flow:

```text
Customer Requirement
↓
Auction Search
↓
Candidate Vehicles
↓
Auction Information
↓
Inspection
↓
Quote
↓
Approval
↓
Purchase
```

Never imply auction access without verified business capability.

---

# 42. EXPORT / DELIVERY

> **Revision 3.** Export is a confirmed capability (ADR 0002 Decision 1). This is an
> active specification, no longer conditional. Destination countries remain an open
> question — a confirmed capability is not a confirmed destination list, and §86
> forbids publishing routes the business cannot service.

```text
Select Item
↓
Destination Country
↓
Destination Port
↓
Transport
↓
Pre-shipment Inspection      where the destination requires it
↓
Documentation
↓
Quote
↓
Confirmation
↓
Shipment
↓
Delivery
```

Clearly distinguish:

- Confirmed
- Estimated
- Quote required

### Pre-shipment inspection is an artefact, not a footnote

Several destinations require third-party inspection before shipment — the recognised
bodies are JEVIC, QISJ and EAA. The certificate is a document on the deal, with an
issuing body, date, and result, not a sentence in a guide.

**This matters more here than for most exporters.** These inspections include a
radiation test, and the company operates in Ibaraki. Treat the certificate as part of
the standard export pack and confirm the requirement per destination.

### Destination eligibility belongs in the data

Age limits, steering side, emission thresholds and inspection regimes vary by
country. Held as structured per-destination rules, a listing can state that it is not
eligible for a route — instead of the buyer discovering it at customs. This is the
same field the catalogue exposes as 購入可能エリア in §19.

---

# 42b. DOMESTIC DELIVERY & HEAVY HAULAGE

> **Revision 3.** Revision 2 modelled delivery generically. Machinery cannot deliver
> itself, and for a business whose domestic side is at least as large as its export
> side, road haulage is a first-class cost line on every machine sale.

A machine moves by 低床トレーラー or セルフローダー, selected by class and weight.
Oversized loads need 特殊車両通行許可, which has a lead time and therefore affects the
delivery date the customer is given.

```text
Machine class and weight     selects the trailer type
Dimensions                   height and width drive permit requirements
特殊車両通行許可              required or not; lead time if required
Route origin                 pickup prefecture, from the item record (§19)
Unloading responsibility     車上渡し or 荷卸し込み — see §32
Access at destination        whether a trailer can reach and turn
```

Quote this separately from the item price and label it per §32. Never fold an
unconfirmed haulage cost into a headline figure.

---

# 43. DELIVERY TRACKING

Future:

```text
Purchased          ✓
Inspection         ✓
Preparation        ✓
Documents          ✓
Transport          ●
Shipment           ○
Arrival            ○
Delivery           ○
```

Only show real operational stages.

---

# 44. MY M.A.S & SONS

Long-term account:

```text
MY M.A.S & SONS

Saved Vehicles
Saved Equipment

My Requests

My Purchases

Documents

Appointments

Delivery Status

Service / Maintenance
```

Use progressive account creation.

---

# 45. SHOWROOM / COMPANY

> **Revision 3.** This section assumed a visitable site. The registered address is an
> apartment room (§2), and no yard or showroom is in evidence. **Whether such a site
> exists is an open question** (Phase 0). Do not commission, plan, or design around
> photography of premises nobody has confirmed.

If a yard or showroom exists, use authentic company content:

- Exterior
- Inventory yard
- Showroom
- Equipment yard
- Staff
- Inspection area
- Location
- Opening hours
- Contact
- Appointment

If it does not, this section reduces to location, hours and contact, the walk-in
channel in §6b is withdrawn, and the weight it carried moves to 出張査定 (§37) — which
becomes the only way a seller and a machine meet.

Prefer authentic photography over stock imagery. Never stock photography of a yard
that is not ours.

---

# 46. COMPANY TRUST

Present:

**M.A.S & SONS 株式会社**

**古物商許可番号 第 401210001551**

Do not alter the number.

Do not infer other licences.

---

# 47. CONTACT

Source reference:

**Mobile:** 08092709540  
**Tel/Fax:** 0296-48-6450  
**Email:** massonsjpn@gmail.com

Verify these details before production launch.

---

# 48. LANGUAGE

Exactly two customer-facing languages:

## English

International-facing experience.

## Japanese

Native Japanese experience.

Do not display additional languages.

Do not add:

- Chinese
- Korean
- Vietnamese
- Filipino
- Portuguese
- Thai
- Turkish
- etc.

Use clean i18n architecture so additional languages could be added later without restructuring the product.

Japanese should be authored/reviewed as native Japanese business content.

---

# 49. MOBILE

Mobile is not compressed desktop.

Priorities:

1. Search
2. Image
3. Item identity
4. Price
5. Primary CTA
6. Key specifications
7. Condition
8. Documents
9. Delivery/export
10. Similar inventory

Detail pages should use a sticky action bar when useful:

```text
[Contact]   [Reserve / Request Info]
```

Only expose supported actions.

---

# 50. DESKTOP

Desktop should leverage:

- Large photography
- Editorial composition
- Multi-column specifications
- Filter sidebars
- Comparison
- Technical information
- Wide gallery
- Storytelling

Recommended content max width:

```text
~1440px
```

---

# 51. MOTION

Motion should communicate quality and hierarchy.

Good:

- Hero reveal
- Subtle image scale
- Page entrance
- Header transition
- Filter transitions
- Gallery transitions
- Button feedback

Avoid:

- Bouncing
- Excessive parallax
- Flashing
- Long blocking animation
- Decorative animation everywhere

Respect `prefers-reduced-motion`.

---

# 52. ACCESSIBILITY

Target WCAG 2.2 AA.

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus
- Correct labels
- Contrast
- Alt text
- Screen-reader support
- Accessible forms
- Adequate touch targets
- Reduced-motion support

---

# 53. SEO

Support:

- Semantic URLs
- Metadata
- Canonicals
- Sitemap
- Breadcrumbs
- Structured data where appropriate
- English SEO
- Japanese SEO
- `hreflang` alternates between the `ja` and `en` versions of every page, and a
  self-referencing canonical on each
- Inventory entity pages
- Category pages
- Useful editorial content

Avoid thousands of thin duplicate pages.

**Facet URLs need an explicit indexing policy.** §21 makes search state URL-driven,
which generates a combinatorially large URL space that crawlers will find. Decide
which facet combinations are canonical and indexable, and exclude the rest — this
must be designed together with §21, not after it.

**Sold items need a URL policy** — redirect, retain with a clear sold notice, or
return gone. Decide it before the first item sells, not after.

> **Revision 2.** `hreflang` was absent from a document mandating exactly two
> locales and canonical URLs. The facet-indexing and sold-item policies were absent
> entirely.

---

# 54. CONTENT MODEL

Do not store inventory as giant free-text descriptions.

Use:

```text
Inventory Item
 ├── Identity
 ├── Category
 ├── Manufacturer
 ├── Model
 ├── Variant
 ├── Specifications
 ├── Pricing
 ├── Availability
 ├── Condition
 ├── History
 ├── Features
 ├── Attachments
 ├── Media
 ├── Inspection
 ├── Documents
 ├── Delivery / Export
 └── Location
```

This enables search, comparison, AI, SEO, recommendations, analytics, and future applications.

---

# 55. API-FIRST ARCHITECTURE

The website must not be the only consumer of inventory data.

Long-term:

```text
                INVENTORY PLATFORM API
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Website         Mobile          AI
          ↓              ↓              ↓
       Customer       Customer       Customer
```

The domain and API should support future clients.

---

# 56. ADMIN / BACK OFFICE

Inventory:

- Create
- Edit
- Publish
- Unpublish
- Price
- Availability
- Media
- Specifications
- Condition
- Documents
- Inspection
- Location

Leads:

- Inquiries
- Valuation requests
- Sourcing requests
- Export requests
- Reservations
- Appointments

Customers:

- Profiles
- Requests
- Purchases
- Documents

Content:

- Pages
- Journal
- FAQs
- Reviews

---

# 57. BULK OPERATIONS

Future admin:

- Bulk publish
- Bulk unpublish
- Bulk price update
- Bulk category assignment
- Bulk media processing
- Bulk metadata update

Use safe confirmation and audit logs.

---

# 58. ANALYTICS

Track meaningful events:

```text
inventory_view
search_performed
filter_applied
favorite_added
compare_added
contact_started
valuation_started
sourcing_started
export_started
reservation_started
appointment_started
```

Use privacy-conscious analytics.

Events are not attribution. An event says *something happened*; attribution says
*where that person came from*, and it has to live on the record, not in an analytics
product. See §58b.

---

# 58b. ATTRIBUTION & REFERRAL

> **Revision 3.** §6b captured an origin channel on unit records. Nothing captured
> campaign detail, and buyer enquiries carried no attribution at all — so the business
> would have known where its stock came from but not where its customers did. ADR 0002
> Decision 5.

### Two field sets, on both sides

Every seller intake and every buyer enquiry carries:

```text
First touch    written once, never overwritten
Last touch     overwritten on each new session
```

Each set holds source, medium, campaign, referrer, landing page, and click
identifiers. Capture is server-side — values read from the request before the browser
can lose them.

### Why the click identifier matters here specifically

This business does not convert at a checkout. It converts on a LINE thread, a
telephone call, or a yard visit, days or weeks after the click. Retaining the click
identifier is what makes offline conversion reporting possible at all — without it,
advertising spend is unmeasurable, because nothing ever ties the eventual deal back to
the click that started it.

The LINE deep link in §6b carries an opaque token for exactly this reason: it is the
bridge between a page view and a conversation that happens outside the website.

### Referral

The referrals that matter to this business come from 整備工場, 板金業者, 解体業者 and
contractors introducing sellers — not from overseas buyer affiliates.

```text
Partner          the introducing business
Referral code    given to the partner, captured on intake and on enquiry
Commission rate  per partner
Accrual          against a completed deal
Payout           reported, then settled through §32b
```

**Payout logic ships only once the 紹介料 policy and its tax treatment are answered
by the business.** Tracking and accrual may be built now; the rate is never invented.
Open question in Phase 0.

### Privacy

Attribution fields joined to a person are personal data. They need a stated retention
period, and that decision belongs with the lawful-basis question ADR 0001 already
raised for permanently retained `DECLINED` records. Collect what is used; delete on
schedule.

---

# 59. NOTIFICATIONS

Future:

- New matching inventory
- Price change
- Item sold
- Inquiry response
- Reservation confirmation
- Appointment reminder
- Sourcing update
- Export update
- Delivery update
- Service reminder

Customers control notification preferences.

---

# 60. PERFORMANCE ARCHITECTURE

Performance is a product requirement.

Recommended principles:

- Server-render content that does not need browser interactivity
- Use client components only when required
- Minimize hydration
- Use streaming where beneficial
- Cache stable data
- Deduplicate requests
- Optimize database queries
- Use CDN for media
- Use responsive images
- Defer non-critical third parties
- Lazy-load below-fold media
- Keep DOM size controlled
- Avoid unnecessary state
- Avoid unnecessary dependencies

Stack direction. `PostgreSQL` and a monorepo are decided; the remainder is an open
decision recorded in Implementation Plan Phase 0 and must be settled by ADR before
the work depending on it starts:

- Next.js
- React
- TypeScript
- Tailwind CSS or token-driven equivalent
- Server Components
- `next/image`
- CDN
- HTTP caching
- Database indexes
- API caching
- Streaming where useful
- Progressive enhancement

Do not introduce libraries simply because they are popular.

---

# 61. PERFORMANCE BUDGETS

Establish measurable budgets.

Prioritize:

### Core Web Vitals
Aim for excellent real-user LCP, INP, and CLS.

### JavaScript
Keep initial client JavaScript extremely low.

### Images
Never ship oversized images.

### API
Common reads should be low-latency and cacheable.

### Database
No N+1 queries.

### Rendering
Avoid unnecessarily large DOM trees.

### Interaction
Primary actions should feel immediate.

Budgets should be continuously measured in CI and production.

---

# 62. 20× PERFORMANCE ENGINEERING CHECKLIST

For every expensive operation ask:

```text
Can we avoid it?
Can we defer it?
Can we cache it?
Can we batch it?
Can we precompute it?
Can we move it server-side?
Can we reduce its payload?
Can we reduce its frequency?
Can we make it incremental?
Can we remove the dependency entirely?
```

Examples:

### Bad
Load 80 inventory images before displaying the first row.

### Better
Load only visible images and progressively fetch additional media.

### Bad
Ship a large client-side application for static content.

### Better
Server-render/static-generate content.

### Bad
Fetch the same inventory metadata repeatedly.

### Better
Cache and deduplicate requests.

### Bad
Perform expensive work synchronously during a customer interaction.

### Better
Move non-critical work to background processing.

---

# 63. CACHING STRATEGY

### Low volatility

- Company information
- Categories
- Legal pages
- Editorial content

Use long cache/revalidation periods.

### Medium volatility

- Inventory metadata
- Search results
- Recommendations

Use controlled caching.

### High volatility

- Availability
- Reservation state
- Transaction-sensitive pricing

Use appropriate freshness guarantees.

Never allow stale caching to misrepresent critical transaction state.

---

# 64. DATABASE PERFORMANCE

Inventory queries must scale.

Use:

- Proper indexes
- Composite indexes where justified
- Query planning
- Cursor pagination where useful
- Selective columns
- No `SELECT *` in performance-sensitive paths
- No N+1
- Connection pooling
- Caching for repeated reads

Design indexes from real query patterns.

---

# 65. INVENTORY SCALABILITY

The interface should remain usable if inventory grows:

```text
100
→ 1,000
→ 10,000
→ 100,000+
```

Use:

- Server-side filtering
- Efficient pagination/cursors
- Search indexing when justified
- CDN
- Cached aggregates where appropriate
- Efficient image delivery

---

# 66. HIGH-LOAD RESILIENCE

Plan for traffic spikes.

Use where appropriate:

- CDN caching
- Rate limiting
- Backpressure
- Request deduplication
- Timeouts
- Safe retries
- Circuit breakers
- Graceful degradation
- Background queues

Do not make customers wait for non-critical work.

---

# 67. GRACEFUL DEGRADATION

Optional systems must not take down the buying journey.

Examples:

### AI unavailable
Search still works.

### Analytics unavailable
Customer journey still works.

### Recommendation service unavailable
Inventory still works.

### 360 service unavailable
Normal gallery still works.

### Shipping estimate unavailable
Show “Quote required.”

Core path:

```text
Open
→ Search
→ View
→ Understand
→ Contact
```

must remain reliable.

---

# 68. SECURITY

Protect:

- Accounts
- Customer information
- Documents
- Inquiry data
- Vehicle documents
- Export documents
- Payment-related data

Use:

- Secure authentication
- Authorization
- Input validation
- Secure headers
- Rate limiting
- Audit logs
- Safe file handling
- Least privilege

Never expose private documents through predictable public URLs.

---

# 69. OBSERVABILITY

Production must be observable.

Monitor:

- Page performance
- Core Web Vitals
- API latency
- Error rate
- Database latency
- Cache hit rate
- Search latency
- Image delivery
- Conversion events

Use logs, metrics, and traces where appropriate.

---

# 70. PERFORMANCE TESTING

Test:

- Mobile
- Desktop
- Slow networks
- Large inventory
- High concurrency
- Large galleries
- Search-heavy usage
- Filter-heavy usage
- Traffic spikes

Performance regression should block releases when critical budgets are exceeded.

---

# 71. DOCUMENT INTELLIGENCE

Future capabilities:

- Auction sheet extraction
- Inspection document extraction
- Vehicle document classification
- OCR
- Translation
- Structured specification extraction

Where possible, extracted data should retain provenance.

Example:

```text
Mileage
Value: {mileage_km} km
Source: {document that supplied it}
Confidence: {high | medium | low}
```

---

# 72. FUTURE 3D / AR / COMPUTER VISION

Keep architecture open for:

- 3D vehicle views
- Equipment 3D views
- AR
- Computer-vision photo classification
- Damage-detection assistance
- Automated media tagging

Do not overload today's experience with speculative technology.

---

# 73. FUTURE VOICE / CONVERSATIONAL COMMERCE

The inventory platform should eventually be consumable through:

- Website
- Mobile app
- AI assistants
- Search engines
- Voice interfaces
- Messaging
- Partner applications

Stable URLs and structured inventory data are strategic infrastructure.

---

# 74. CUSTOMER LIFECYCLE

Vehicles:

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

This makes the platform more valuable than an inventory catalogue.

---

# 75. CUSTOMER JOURNEY CLARITY

Every major page should answer:

### What is this?
### Is it suitable for me?
### Can I trust the information?
### What does it cost?
### What happens next?
### What should I click?

If these are unclear, redesign the hierarchy.

---

# 76. CONVERSION PRINCIPLE

One dominant action per major page.

### Homepage
Explore Inventory

### Vehicle
Contact / Reserve

### Equipment
Request Information

### Sell
Request Valuation

### Source
Submit Sourcing Request — gated until M16, see §14

### Export
Request Export Quote

### Showroom
Book Appointment — only if a visitable site exists, see §45

Only expose actions actually supported by the business.

> **Revision 3.** "Request Export Quote" is no longer hedged: export is confirmed
> (ADR 0002 Decision 1). "Submit Sourcing Request" and "Book Appointment" remain
> conditional for unrelated reasons — sourcing is deferred to M16, and the showroom
> depends on the open yard question.

---

# 77. MICROCOPY

Use short, confident language.

Avoid:

- Marketing fluff
- Fake urgency
- Overpromising
- Excessive exclamation marks
- AI-generated filler
- Long unnecessary paragraphs

Prefer:

> View details

> Request information

> Save vehicle

> Compare

> Request valuation

> Ask about this machine

> Contact M.A.S & SONS

---

# 78. ERROR / EMPTY / LOADING UX

## Empty

> No vehicles match your current filters.

Actions:

- Clear filters
- Expand search
- View similar vehicles
- Request sourcing

## Error

Instead of:

> HTTP 500

Use:

> We couldn't load this inventory right now.

Actions:

- Retry
- Return to inventory

## Loading

Use:

- Skeletons
- Progressive images
- Meaningful progress
- Optimistic interactions where safe

Avoid blank screens.

---

# 79. FORMS

Forms should be:

- Short
- Progressive
- Clear
- Mobile-friendly
- Validated
- Accessible

Request only necessary information.

---

# 80. INTERNATIONAL EXPERIENCE

International customers may not understand Japanese purchasing/export processes.

Explain:

- Purchasing
- Inspection
- Documentation
- Transport
- Export
- Delivery
- Customer responsibilities

Use progressive disclosure.

---

# 80b. BUYING-PROCESS GUIDES

> **Revision 3.** Revision 2 described *explaining* the process in two places (§80,
> §81) but specified no guide. There are three distinct routes, and a single
> vehicle-shaped guide would be wrong for two of them.

Author these as **structured step records, not prose pages.** The same records then
drive the customer-facing guide and the deal document checklist in Architecture §65 —
one source of truth, two renderings. When a required document changes, it changes
once.

### Route 1 — 買取, the seller journey

```text
相談 (LINE · 電話 · web · 来店)
↓
査定  — 出張査定 for machinery, see §37
↓
提示  — the offer figure
↓
成約 or お断り
↓
書類
↓
入金
↓
引取
```

### Route 2 — domestic purchase

```text
見積 → 契約 → 書類 → 入金 → 名義変更 → 納車
```

Documents the buyer supplies for a registered vehicle:

```text
印鑑証明書        issued within 3 months
実印
車庫証明          allow 3–7 business days from the police station
委任状            where we act as agent
```

We supply 車検証 and 譲渡証明書. 移転登録 is filed within 15 days at the 運輸支局.

**The exception that makes this route two routes.** Machinery that is not
road-registered has **no 車検証 and no 名義変更**. It transfers on 売買契約書 and
譲渡証明書, with 特定自主検査 records where they exist. Road-going units — crane
trucks, dump trucks, 大型特殊 — follow the registered path above. The guide must
resolve from the item's category *and* its registration status, never from category
alone.

### Route 3 — export purchase

```text
Enquiry → Quote (term per §32) → Invoice → Payment (§32b) → 輸出抹消登録
→ Pre-shipment inspection where required (§42) → Booking → Shipment
→ Documents released → Arrival
```

Buyer responsibilities — customs clearance, duty, destination compliance — are stated
plainly. §86 applies throughout: do not state a duty, tax or landed figure the
business cannot compute.

### Shipping and terms explainer

A companion page covering, in our own words:

- RoRo versus container, and when each applies
- domestic haulage for machinery — trailer type, permits, who unloads (§42b)
- what each delivery term includes and where responsibility transfers (§32)
- the document set, and which party holds each item

Class 3 content under ADR 0001 Decision 3 — authored natively in both languages, not
translated. Keep the structured steps in class 2 so only the explanation is written
twice.

---

# 81. JAPANESE EXPERIENCE

Japanese must feel native.

Consider:

- Japanese business terminology
- Domestic purchasing
- Vehicle inspection / shaken where applicable
- Local delivery
- Showroom
- Financing where supported
- Legal information

Do not treat Japanese as a translated English page.

---

# 82. FUTURE PERSONALIZATION

Potential:

- Recently Viewed
- Saved Items
- Saved Searches
- Recommended Items
- Price Alerts
- New Match Alerts
- Recently Compared

Personalization should be useful and transparent.

---

# 83. ADMIN EXPERIENCE

A premium customer experience requires a good internal product.

Admin should prioritize:

- Fast inventory entry
- Bulk operations
- Media management
- Structured specifications
- Status changes
- Pricing
- Lead management
- Search
- Auditability

Reduce repetitive manual work.

---

# 84. DESIGN-TO-CODE PRINCIPLE

Implementation must preserve design intent.

Do not create:

- Placeholder-like cards
- Generic Bootstrap layouts
- Inconsistent buttons
- Random spacing
- Improvised colors
- Arbitrary border radii
- Different typography on every page

Use the design system consistently.

---

# 85. BUSINESS LOGIC PROTECTION

The redesign is primarily a UX/UI and platform modernization.

Do not silently change:

- Pricing rules
- Inventory rules
- Purchase rules
- Contact workflows
- Permissions
- Validation
- Payment behavior
- Export behavior
- Legal policies
- Business status

If a design improvement requires business-rule changes:

> STOP and identify the required business decision.

Never invent the rule.

---

# 86. DATA TRUTH PRINCIPLE

Never fabricate:

- Vehicle specifications
- Equipment specifications
- Mileage
- Operating hours
- Prices
- Accident history
- Repair history
- Inspection
- Warranty
- Availability
- Shipping costs
- Taxes
- Duties
- Auction grades
- Certifications

If data is unavailable:

**Hide it**

or:

**Clearly label it unavailable / estimated / quote required.**

---

# 87. 10-YEAR ROADMAP

## 2026 — FOUNDATION

Ordered. Acquisition precedes presentation.

1. Core records — inventory item, party, deal, bilingual reference tables with
   alias sets, staff auth, audit log
2. Purchase intake and valuation, Japanese-first, including 出張査定 booking
3. Internal stock operations, status changes, media pipeline
4. Public bilingual catalogue — search, facets, sort, detail pages, gallery, and the
   LINE enquiry deep link
5. Enquiry and contact workflows, with attribution captured from the first record
6. Deal document packs and settlement — domestic and export
7. Homepage and the buying-process guides
8. SEO, performance foundation, accessibility

> **Revision 3.** Settlement joins step 6 and the guides join step 7: export is
> confirmed and payments is now a domain (ADR 0002 Decisions 1 and 3). Attribution
> moves into step 5 because it cannot be backfilled — a record created without it is
> permanently unattributed.

Favorites, compare, and sourcing move to 2027 unless enquiry volume shows the need
earlier. Referral payout and 概算査定 follow the data and the policy decisions they
depend on. The public site is a read view over records the internal system already
maintains; building it first means building it against invented data.

## 2027–2028 — DIGITAL COMMERCE

- Customer accounts
- Garage
- Reservations
- Appointments
- Financing requests where supported
- Export quote workflows
- Delivery tracking
- Document center

## 2028–2030 — INTELLIGENT MARKETPLACE

- AI concierge
- Natural-language search
- Recommendations
- AI comparison
- Smart alerts
- AI-assisted translation
- Intelligent lead qualification

## 2030–2033 — JAPANESE SOURCING PLATFORM

- Auction sourcing
- Auction candidates
- Inspection reports
- Supplier integrations
- Global buyer accounts
- Advanced export workflow

## 2033–2036 — VEHICLE & EQUIPMENT ECOSYSTEM

```text
Discover
↓
Search
↓
Compare
↓
Buy
↓
Deliver / Export
↓
Own / Operate
↓
Service
↓
Value
↓
Sell / Trade
↓
Buy Again
```

---

# 88. CLAUDE DESIGN BEHAVIOR

Claude should operate as:

### Senior Product Designer
Understand customer intent before designing.

### Automotive UX Specialist
Understand vehicle discovery and purchasing.

### Heavy Equipment UX Specialist
Understand technical machinery information.

### Japanese UX Specialist
Respect Japanese information hierarchy and terminology.

### Design Systems Architect
Create reusable, scalable patterns.

### Performance Engineer
Treat speed as a product feature.

### Accessibility Specialist
Build inclusive experiences.

### Product Strategist
Think beyond the current release.

---

# 89. CLAUDE CODE BEHAVIOR

Before implementation:

1. Read the ADRs first, in order —
   `docs/decisions/0001-lifecycle-and-scope.md`, then
   `docs/decisions/0002-commerce-capabilities.md`. They supersede earlier revisions
   of this document; where they conflict with it, the ADR wins.
2. Read Implementation Plan §32 for what the current milestone actually is.
3. Inspect the repository as it actually is.
4. Confirm the business rule exists before encoding it; never invent one.
5. Identify data models.
6. Identify what is already built and reusable.
7. Create an implementation plan.
8. Implement incrementally.
10. Test continuously.
11. Measure performance.
12. Remove unnecessary complexity.
13. Validate responsive behavior.
14. Validate accessibility.
15. Validate production build.

Do not rewrite working architecture without a measurable reason.

> **Revision 2.** Steps that assumed an inherited codebase — reusable code, existing
> API contracts, existing performance bottlenecks — were removed. The project is
> greenfield; there is nothing to inspect for them yet.

---

# 90. CREATIVE DECISION FRAMEWORK

When this document does not specify something:

Ask:

1. What is the customer trying to accomplish?
2. What is the fastest clear path?
3. What would a premium Japanese business do?
4. What would a modern marketplace do?
5. What increases trust?
6. What reduces friction?
7. What works on mobile?
8. What survives five years of evolution?
9. Can the architecture support AI and data growth?
10. Does it preserve real business operations?

Then choose the strongest solution.

---

# 91. DO NOT BLINDLY FOLLOW THE BRIEF

This document is the strategic foundation.

It is not permission to stop thinking.

If Claude identifies a materially better solution:

1. Identify the problem.
2. Explain the reasoning.
3. Propose the improvement.
4. Confirm compatibility with business rules.
5. Implement the stronger solution.

Creative thinking is required.

---

# 92. PREMIUM UI QUALITY BAR

The final website should compete visually with premium automotive brands and modern commerce products.

Quality must be visible in:

- Photography
- Typography
- Grid
- Spacing
- Interaction
- Motion
- Information hierarchy
- Responsive behavior
- Technical detail
- Microcopy
- Loading states
- Empty states
- Error states

The objective is:

> **Beautiful + useful + fast + trustworthy + scalable.**

---

# 93. NO-COMPROMISE RULE

Do not sacrifice:

### Performance for decoration.

### Accessibility for aesthetics.

### Data integrity for conversion.

### Maintainability for implementation speed.

### Mobile quality for desktop presentation.

### Business truth for marketing claims.

### Scalability for today's inventory size.

---

# 94. FINAL ACCEPTANCE STANDARD

## Brand
Does it feel like M.A.S & SONS?

## Japanese
Does it feel authentically Japanese without clichés?

## Premium
Would a serious automotive customer trust the design?

## Industrial
Can the system credibly present heavy machinery?

## Marketplace
Can customers quickly discover the right inventory?

## Commerce
Can customers clearly understand the next step?

## Performance
Has unnecessary work been aggressively eliminated?

## 20× mindset
Have we challenged every expensive request, component, dependency, image, query, and process?

## Resilience
Does the core journey survive optional-system failures?

## Accessibility
Can a broad range of users operate it?

## Future
Can the architecture support the next decade?

---

# 95. FINAL PRODUCT STATEMENT

Build:

> **A premium Japanese digital platform for vehicles and heavy equipment, combining automotive showroom quality, marketplace-grade discovery, industrial technical clarity, trustworthy business information, and an aggressively optimized technology foundation designed for the next decade.**

Do not build:

> Another dealership website.

Build:

# M.A.S & SONS
## DIGITAL PLATFORM 2036

---

# 96. IMPLEMENTATION COMMANDMENTS

### THINK BIG.

### DESIGN PREMIUM.

### BUILD LIGHT.

### LOAD ONLY WHAT IS NEEDED.

### CACHE WHAT CAN BE CACHED.

### VERIFY WHAT MUST BE VERIFIED.

### NEVER INVENT BUSINESS DATA.

### PROTECT THE CORE CUSTOMER JOURNEY.

### MEASURE PERFORMANCE.

### REMOVE WASTE.

### BUILD FOR 2036, NOT JUST 2026.

---

## SOURCE REFERENCE

Primary supplied licence/registration reference:

**M.A.S & SONS 株式会社**  
**古物商許可番号:** 第 401210001551  
**代表取締役:** アリワシーム  
**Mobile:** 08092709540  
**Tel/Fax:** 0296-48-6450  
**Email:** massonsjpn@gmail.com  
**Address:** 茨城県下妻市福田2175番地2 ローズナミキ1号棟102号室

The supplied licence/registration artwork must remain available to the project team as the source reference.

Legal and business information must be verified with the company before production launch.
