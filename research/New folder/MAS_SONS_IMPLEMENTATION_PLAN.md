# M.A.S & SONS — Implementation Plan

**Document:** `MAS_SONS_IMPLEMENTATION_PLAN.md`  
**Project:** M.A.S & SONS 株式会社  
**Planning Horizon:** 2026–2036  
**Status:** Production implementation blueprint — Revision 3 (2026-09-04)  
**Primary References:** `MAS_SONS_MASTER_DESIGN_BRIEF.md`, `MAS_SONS_PROJECT_ARCHITECTURE.md`

---

## 1. Purpose

This document converts the Master Design Brief and Project Architecture into an executable implementation strategy.

The objective is not to build a collection of attractive pages. The objective is to build a production-grade digital showroom and automotive/equipment commerce platform that is:

- premium and trustworthy
- fast under real-world conditions
- mobile-first and responsive
- English/Japanese only
- SEO- and AI-discovery-ready
- accessible
- secure
- maintainable for the next decade
- extensible without premature over-engineering
- resilient when optional integrations fail
- measurable in production

### Core implementation principle

> **Inspect first. Plan second. Implement third. Measure continuously.**

Claude Code must never assume that the repository matches the reference architecture. The actual codebase is authoritative for existing implementation details, while the design brief and architecture define the intended target state.

### Greenfield as of 2026-09-03

There is no existing repository. The migration and preservation risk much of this
plan is organised around does not yet apply. Phase 0 is therefore a decision-and-
scaffold phase, not an audit. From the first commit onward, "inspect first" applies
in full.

### Revision 3 changes

- Export is confirmed. Phase 10 becomes an active specification; the Brief's §14
  capability gate is removed.
- Payments becomes a capability with a phase of its own (Phase 23) landing at M7
  alongside deal document packs — settlement and paperwork are the same event.
- Attribution moves into M6 with enquiry, because it cannot be backfilled.
- The LINE enquiry deep link moves from M9 to M5. It is a URL, not an integration.
- Phase 4 gains a category-resolved sort specification and the equipment facets
  buyers actually select on; Phase 0 gains alias sets on reference tables.
- Phase 8 gains 出張査定 booking; Phase 24 adds the three buying-process guides.
- Nine new business questions are recorded in Phase 0.

Rationale: `docs/decisions/0002-commerce-capabilities.md`.

### Revision 2 changes

- Acquisition (買取) becomes the first implemented capability rather than the eighth.
- The inventory lifecycle gains `OFFERED / VALUED / DECLINED / PURCHASED`.
- Vehicles and equipment are one entity with one set of components and routes.
- Phase 1's design system is cut to tokens plus components proven by real screens.

Rationale: `docs/decisions/0001-lifecycle-and-scope.md`.

---

# 2. Non-Negotiable Rules

## 2.1 Business rules

- Do not change existing business logic unless explicitly approved.
- Do not invent vehicle inventory, prices, specifications, legal claims, shipping promises, inspection results, reviews, company facts, or customer data.
- Do not fabricate Japanese legal/compliance information.
- Existing authoritative business data remains authoritative.
- If required data is missing, create a clear extension point rather than inventing data.

## 2.2 Language

Customer-facing language is strictly:

- English
- Japanese

Do not add additional customer-facing languages unless explicitly approved.

## 2.3 Architecture

- Prefer a modular monolith.
- Keep domain boundaries explicit.
- Do not introduce microservices merely for architectural appearance.
- Separate UI, domain logic, data access, integrations, and infrastructure concerns.
- Keep APIs stable and versionable.
- Background jobs should handle expensive/non-blocking work.
- Optional integrations must fail gracefully.

## 2.4 Frontend

- Reuse existing working components when they are sound.
- Do not create duplicate components for the same responsibility.
- Prefer server rendering/server components where appropriate.
- Minimize client-side JavaScript.
- Avoid unnecessary global state.
- Keep URLs shareable and filter state URL-driven.
- Do not solve a CSS problem with JavaScript.
- Do not solve a data problem with hardcoded UI.

## 2.5 Performance

The project uses a **20× performance mindset**.

This is an engineering objective, not a literal promise that every operation will become 20× faster.

For every expensive operation, ask:

1. Can it be avoided?
2. Can it be deferred?
3. Can it be cached?
4. Can it be batched?
5. Can it be precomputed?
6. Can it run server-side?
7. Can the payload be reduced?
8. Can the work become incremental?
9. Can a dependency be removed?

No performance claim is accepted without measurement.

## 2.6 Quality gate

A phase is not complete merely because the UI looks correct.

Relevant gates must pass:

- typecheck
- lint
- unit tests
- integration tests
- E2E tests
- accessibility checks
- responsive checks
- visual regression where applicable
- production build
- performance measurement
- security review where applicable

---

# 3. Implementation Strategy

Implementation proceeds through **vertical slices**, not by building the entire frontend first and connecting functionality later.

Each slice should make one meaningful part of the product usable end-to-end.

### Build order

**§32 is the single authoritative build order.** It is not restated here, because
three divergent orderings in one document is what this revision exists to fix.

Summarised: core records → purchase intake and valuation → internal stock
operations → design tokens and shell → public catalogue → enquiry → document packs
→ homepage → LINE → SEO and accessibility → hardening → production readiness →
launch. Favourites, admin depth, auction sourcing and AI follow launch and are
demand-driven.

**Why the order changed.** Revision 1 built the shop window before the shop: the
homepage was step 4 and acquisition step 9. The public site is a read view over
records the internal system already maintains. Built first, it is built against
invented data and then rebuilt. Built after intake and stock exist, it renders real
records on its first run.

> **Revision 2.** This section previously carried its own 17-step ordering that
> disagreed with §32 — it placed favourites, admin depth, auction sourcing and AI
> *before* hardening and launch, where §32 places them after, and it omitted SEO
> and accessibility entirely. The list was removed rather than corrected, so that
> the document states the order once.

---

# Phases 0–22 — capability specifications, not a sequence

**The numbered phases below are a catalogue of capabilities, not the order in which
they are built.** Phase numbers are retained only because ADR 0001 and other
sections cite them. For sequence, read §32 and nothing else.

| Phase | Capability | Milestone |
|---|---|---|
| 0 | Decisions & scaffold | M0 |
| 1 | Tokens & foundation | M4 |
| 2 | Global application shell | M4 |
| 3 | Homepage | **M8** |
| 4 | Inventory & search | M5 |
| 5 | Detail page | M5 |
| 6 | Category specification schema | M1 (schema) → M5 (rendering) |
| 7 | Lead & contact workflows | M6 |
| 8 | Acquisition — intake, valuation, offer | **M2** |
| 9 | Auction sourcing | M16 (post-launch) |
| 10 | Export & delivery | M7 |
| 11 | Favourites, comparison, accounts | M14 (post-launch) |
| 12 | Internal stock operations, admin, CMS | M3 → M15 |
| 13 | AI-ready architecture | M17 (post-launch) |
| 14 | SEO & AI discovery | M10 |
| 15 | Accessibility | M10 |
| 16 | Performance engineering | M11 |
| 17 | Security hardening | M11 |
| 18 | Testing | continuous, from M0 |
| 19 | Observability | M0 (error tracking) → M12 |
| 20 | Deployment & release | M12 |
| 21 | Launch readiness | M13 |
| 22 | Post-launch optimisation | M18 |
| 23 | Payments & settlement | **M7** |
| 24 | Guides & structured explainers | **M8** |

**Milestones with no phase body — these must be written before they are built:**

| Milestone | Missing specification |
|---|---|
| M1 | Core records — `InventoryItem`, `Party`, `Deal`, reference tables, staff auth, audit log |
| M3 | Internal stock operations and the media pipeline (Phase 12 covers admin only) |
| M7 | Deal document packs, domestic and export (Phase 10 covers the customer-facing side, Phase 23 the settlement side) |
| M9 | Messaging API integration and notifications — note the LINE *enquiry deep link* is not part of this and ships at M5 (Phase 5) |

> **Revision 3.** M7's settlement half now has a phase body (Phase 23); its document
> packs still do not. M9 was narrowed — Revision 2 read it as "LINE", which caused the
> enquiry deep link to be deferred with the Messaging API even though it is only a
> URL. See ADR 0002 Decision 6.

> **Revision 2.** The four milestones above are the strategic core of this revision
> and currently exist only as cells in the §32 table. Everything specified in
> detail below is the public web layer, which §32 deprioritises. Do not read the
> depth of a phase body as a signal of its importance.

---

# 4. Phase 0 — Decisions & Scaffold

## Goal

Resolve the open business questions and stand up the repository. There is no
existing system to audit.

### Business questions that must be answered before Phase 2

- Domestic vs export split, and which destination countries — **export itself is now
  confirmed (ADR 0002); the destination list is not**
- Whether export logistics are handled in-house or through a forwarder
- Staff count, roles, and who is authorised to set purchase prices
- What tooling is in use today — spreadsheet, paper, nothing
- The document set genuinely required for each destination, confirmed by the company
- 古物商法 and 特商法 display obligations, confirmed by someone qualified in Japan

### Added in Revision 3

- **LINE Official Account ID.** The business card carries only a QR image. The
  enquiry deep link at M5 cannot ship without the text ID.
- **Does a yard or showroom exist?** The registered address is an apartment room.
  Brief §45 and the walk-in channel in §6b both depend on the answer, and if there is
  none, 出張査定 becomes the only way a seller and a machine meet.
- **紹介料 policy and its tax treatment.** Referral tracking and accrual may be built
  without it; payout may not.
- **JUMVEA membership** — whether the escrow settlement method is available.
- **返品特約 policy**, required by 特商法 once payment methods are published.
- **Confirmed 特商法 display set**, from someone qualified in Japan.
- Two card-transcription items to confirm with the company: 「タイヤシャワー」 versus
  「タイヤショベル」, and the duplicated 「クレーン車」 entry. See Brief §2.

Do not model the domain around guesses at these. Where an answer is missing, record
it as an open question and design the extension point rather than inventing the rule.

### Scaffold

- monorepo, package manager, framework, TypeScript, lint, format
- PostgreSQL with migrations, empty
- CI running typecheck, lint, **unit and integration tests**, and build on every commit
- test runner selected and wired into CI from the first commit
- error tracking wired before the first record exists
- **backup and verified restore** for the acquisition database
- bilingual reference-table schema (`label_ja` / `label_en`, plus an **alias set**
  per key used for search matching only — records store keys only)
- reference-table seeds needed before any record exists: category, maker, delivery
  term, carriage mode, payment method, settlement status, sort key, and the equipment
  facet vocabularies (weight class, emission standard, auxiliary hydraulics, arm
  configuration, undercarriage type)
- `docs/decisions/` containing the ADRs
- `.env.example`

> **Revision 2.** Six items were added. The first CI definition ran typecheck, lint
> and build only, while §2.6 demands unit, integration and E2E — so the quality gate
> was unenforceable from day one. Backups previously appeared for the first time at
> M12, but the offer/purchase/sale dataset starts accumulating at M2 and, per ADR
> 0001 Decision 1, can only be accumulated forward; losing it is the one failure in
> this plan with no remedy after the fact. Reference tables previously appeared only
> as five words in the §32 milestone table despite ADR 0001 Decision 3 making them
> the decision that renders bilingual either free or permanently expensive.

### Stack decisions still open

`PostgreSQL` and a monorepo are decided. The following are **not** decided and must
be recorded as ADRs before the work that depends on them begins:

- hosting and runtime shape, which is constrained by the two items below
- Japanese full-text tokenisation — default PostgreSQL full-text search does not
  tokenise Japanese, and the required extension is not offered by every managed
  provider. Verify against live provider documentation; do not assume.
- background job runtime for the media pipeline, and shared state for rate limiting
- ORM / data-access layer, which must make projections explicit (Architecture §34
  forbids `SELECT *` in performance-sensitive paths and §43 lists internal fields
  that must never reach a response)
- object storage and image pipeline
- authentication mechanism and the staff role/permission matrix
- **payment gateway.** The domain is decided (ADR 0002 Decision 3); the provider is
  not. It must support JPY, cross-border card acceptance, 3-D Secure, hosted fields
  or hosted checkout so no card number reaches our systems, signed webhooks, and
  refunds. Record the ADR before Phase 23 starts.
- FX rate source and staleness policy, if a price is ever shown in a second currency

Do not scaffold past the point where one of these is required. Record the decision
first.

### Exit criteria

- The six business questions above are answered, or each unanswered one is recorded
  as an open question with a named owner and an extension point designed in its place.
- Monorepo scaffolded; typecheck, lint, tests and build run green in CI.
- Migrations run against an empty PostgreSQL database.
- Backup runs and a restore has been performed successfully at least once.
- `.env.example` is present and no production secret exists outside the secret store.
- ADR 0001 and ADR 0002 are in `docs/decisions/`, and any stack decision taken has
  its own ADR.
- Reference tables are seeded with alias sets, and a search for ユンボ resolves to the
  `hydraulic_excavator` key in a unit test before any catalogue exists.

> **Revision 2.** This phase previously required inspecting 25 artifacts of an
> inherited codebase and producing a written audit of "current architecture,
> duplicated code, migration risks, existing technical debt", then exited on
> "Repository is understood" and "Existing functionality that must be preserved is
> identified". There is no existing system — the same section says so. Those
> criteria were unsatisfiable and have been replaced with M0's actual outcome.

---

# 5. Phase 1 — Foundation & Design System

## Goal

Create the technical foundation, and only those visual primitives that real screens
have already demanded.

**Scope correction.** Revision 1 required the full component catalogue here.
Roughly 35 components against ten states each is ~350 speculative permutations
authored before any real content exists — and speculative components become exactly
the improvised, inconsistent output the design brief's §84 warns against, once real
data contradicts them.

### Implement fully — tokens and layout

- design tokens
- typography
- spacing scale
- color system
- border/radius system
- elevation strategy
- container system
- grid
- responsive breakpoints

### Implement on second use — primitives

Build these inside the screen that first needs them; promote to the design system
when a second screen needs them.

- buttons
- links
- inputs
- selects
- checkboxes/radios
- badges
- cards
- dialogs
- drawers
- tabs
- breadcrumbs
- skeletons
- empty states
- error states
- loading states

### Visual direction

The UI should communicate:

- Japanese precision
- restraint
- premium quality
- confidence
- clarity
- automotive credibility

Avoid:

- excessive rounded cards
- excessive gradients
- generic SaaS appearance
- giant shadows
- unnecessary animation
- decorative Japanese clichés
- emoji-driven UI

### Exit criteria

- Design tokens are centralized and complete.
- Desktop/tablet/mobile behavior is defined.
- Typography is consistent.
- Accessibility fundamentals are established in the token and layout layer.

> **Revision 2.** "Core primitives are reusable" and "accessibility is built into
> primitives" were removed. Primitives are no longer a Phase 1 deliverable — a
> component is built inside the screen that first needs it and promoted on second
> use. Phase 1 could not exit under criteria describing work it no longer does.

---

# 6. Phase 2 — Global Application Shell

## Goal

Establish navigation and shared layout behavior.

> **Revision 2. Milestone M4.** The shell is built after M2–M3, from primitives
> those screens proved necessary — not before them. Its navigation must only expose
> routes that exist at M4. Under §32, favourites is M14 (post-launch), export is
> M7/M10 and the homepage is M8, so the previous exit criterion "all primary routes
> are reachable" is unsatisfiable here and has been narrowed to the routes that
> exist. Do not ship navigation to unbuilt destinations.

### Implement

- header
- navigation
- language switcher: EN / JP
- contact CTA
- footer
- mobile navigation
- breadcrumb system
- page container
- global loading behavior
- global error handling
- not-found page
- legal/footer navigation

### Header behavior

Desktop, showing only what exists at M4:

- logo
- Stock            # one catalogue; category is a filter
- 買取 / Sell
- About
- EN / 日本語
- Contact

Added later, each with the milestone that builds it: Export (M7), Favorites (M14),
Source (M16). See Brief §14.

Behavior:

- transparent/overlay state where appropriate
- solid/blurred state on scroll
- minimal layout shift
- accessible keyboard navigation

### Exit criteria

- Every route the navigation offers exists at M4, and every route that exists at M4
  is reachable. No entry points at an unbuilt destination.
- Mobile navigation works.
- Language switching is coherent.
- No header/footer duplication exists.
- Header does not create layout instability.

> **Revision 3.** Two corrections. The favourites entry was removed from the implement
> list: Phase 11 puts favourites at M14 and says plainly not to ship a control that
> does nothing. And "all primary routes are reachable" was replaced — the Revision 2
> note above had already called that criterion unsatisfiable at M4 but never amended
> the list it referred to.

---

# 7. Phase 3 — Homepage

## Goal

Create the primary brand and conversion experience.

> **Revision 2. Milestone M8, not M3.** The homepage is a read view over records
> M1–M5 already maintain; built earlier it is built against invented data and then
> rebuilt. Three of its listed sections are owned by later milestones — reviews and
> journal by M15, auction sourcing by M16 — and placeholders are forbidden (§2.1).
> Render only sections backed by real records at M8; omit the rest.

### Sections

1. Hero
2. Vehicle search
3. Featured inventory
4. From Japan
5. Why M.A.S & SONS
6. Services
7. Auction sourcing
8. Global export
9. Reviews
10. Showroom
11. Journal
12. Footer

### Hero

Prioritize:

- strong automotive imagery
- short value proposition
- immediate inventory CTA
- secondary contact/source CTA
- excellent LCP performance

### Search

Support discovery by:

- make
- model
- category
- keyword

Do not build an artificial search experience disconnected from actual inventory data.

### Exit criteria

- Homepage represents the final brand direction.
- Primary CTAs work.
- Hero is optimized for LCP.
- Mobile experience is intentionally designed.
- Content is SEO-friendly.
- No unnecessary client JavaScript is introduced.

---

# 8. Phase 4 — Inventory & Search

## Goal

Build the core discovery engine.

> **Revision 2. Milestone M5.** One index, one results page, one URL scheme, one
> card. Vehicles and equipment are two *facet sets*, not two search systems, and
> category is a filter — never a path segment. The filter list below is
> vehicle-oriented; equipment facets (operating hours, operating weight,
> attachments) belong to the same panel and must be designed with it, not two
> phases later. Japanese tokenisation is a correctness prerequisite for this phase
> and is an open stack decision — see Phase 0.

### Inventory page

Implement:

- inventory count
- search
- filter sidebar
- mobile filter drawer
- sorting
- grid/list presentation where useful
- empty state
- URL-driven filters
- shareable filtered URLs

### Filters

Use only data actually supported by the backend.

Potential fields:

- Make
- Model
- Price
- Year
- Mileage
- Body Type
- Fuel
- Transmission
- Drive
- Color
- Engine
- Condition
- Auction Grade
- Repair History
- Inspection
- Registration
- Stock Location
- Export availability

### Sorting

Category-resolved, exactly as facets are. Architecture §16b holds the specification;
the three requirements that are defects if omitted are a deterministic tiebreaker,
explicit NULL placement, and an index covering each offered sort.

```text
Both          listed_desc (default) · price_asc/desc · year_desc/asc ·
              reduced_desc · enquiries_desc · reference
Vehicles      mileage_asc / mileage_desc
Equipment     hours_asc / hours_desc
```

### Equipment facets

Ship with the vehicle facets, not two phases later: weight class (banded),
排出ガス規制対応, auxiliary hydraulics, arm configuration, undercarriage type and shoe
width, crane specification, pickup prefecture, and `purchasable_area`. See
Architecture §8 and Brief §19.

### Search architecture

Search must support:

- exact identifiers
- make/model queries
- partial queries
- **alias matching** — a query for ユンボ returns records stored as
  `hydraulic_excavator`. Without it the catalogue returns nothing for the words the
  business prints on its own card.
- natural language expansion later
- typo tolerance where appropriate
- ranking
- filters
- pagination
- future AI retrieval

### Performance

Prevent:

- N+1 requests
- huge initial payloads
- client-side loading of the entire inventory
- unbounded API queries

### Exit criteria

- Search is reliable.
- Filters are shareable.
- Inventory remains usable with large datasets.
- Desktop and mobile filtering work.
- Search/filter performance is measured.

---

# 9. Phase 5 — Detail Page

## Goal

Create a high-trust presentation and conversion page for any inventory item.

**Revision 2.** This phase and Phase 6 build **one** template at `/stock/[slug]`.
The requirements listed across both phases are the union of what that template must
support; which specification schema renders is resolved from `category`. They are
listed separately because vehicle and equipment buyers need different information
above the fold, not because they need different pages.

### Required areas

- breadcrumb
- title
- price
- stock/reference number
- favorite
- primary CTA
- image gallery
- specifications
- condition
- inspection
- equipment/features
- documents
- export information
- showroom/seller information
- similar vehicles

### Gallery

Support where available:

- Exterior
- Interior
- Dashboard
- Rear
- Engine
- Inspection
- Auction Sheet
- Documents
- 360°
- video

### Data architecture

Clearly distinguish:

- standard equipment
- optional equipment
- fitted equipment
- verified inspection data
- seller-provided information
- system-derived information

Never present uncertain information as verified fact.

### Enquiry paths on the item

- **LINE deep link**, pre-filled with the reference number, title and an opaque
  attribution token (Brief §6b, §58b). It is a URL — it ships here at M5 and does not
  wait for the Messaging API at M9. Desktop needs the QR-plus-ID fallback, never a
  dead link.
- Per-item enquiry form, which reaches the workflow built in Phase 7.

### Price presentation

Show `price_status` and `delivery_term` together — the first says how certain the
number is, the second says what it includes and where responsibility ends. Terms
available are constrained by carriage mode; `CFR` and `CIF` cannot appear on a road
delivery. See Architecture §10.

Show the pickup prefecture, which is the input to a haulage quote (Brief §42b).

### Mobile

Use a sticky bottom CTA for high-intent actions.

### Exit criteria

- Detail pages render from authoritative inventory data.
- Media is optimized.
- Gallery is responsive.
- Structured data is valid.
- Contact/export actions work.
- No misleading information is displayed.

---

# 10. Phase 6 — Category Specification Schema

> **Revision 2.** Renamed. There is one entity and one detail template; `category`
> selects which specification schema applies. This phase defines that resolution for
> every category — passenger vehicles included — not a parallel equipment system.
> The schema itself belongs to core records (M1); its rendering to M5.

## Goal

Support heavy equipment as a first-class category within the shared detail template
built in Phase 5 — operating hours, weight, attachments, and maintenance history
presented with the same credibility as vehicle specifications.

**Revision 2.** No separate equipment page, card, gallery, or route. This phase adds
a specification schema and the fields behind it, not a parallel component tree.

### Equipment categories may include

- excavators
- wheel loaders
- bulldozers
- tractors
- crane trucks
- trailers
- dump trucks
- trucks
- other supported equipment

### Requirements

Do not force equipment into a passenger-car-only schema.

Support domain-specific attributes such as:

- operating hours
- engine information
- operating weight
- capacity
- attachments
- manufacturer
- model
- year
- condition
- inspection
- dimensions
- location
- export availability

Only implement fields supported by real business data.

### Exit criteria

- Equipment has an appropriate information hierarchy.
- Passenger vehicle UI is not incorrectly reused for specialized equipment.
- Shared components remain reusable where semantics match.

---

# 11. Phase 7 — Lead & Contact Workflows

## Goal

Make conversion paths reliable and low-friction.

> **Revision 2. Milestone M6.** Buyer-side enquiries only. Seller contact is
> acquisition (Phase 8, M2) and creates an `InventoryItem`, not a lead. Sourcing
> requests belong to M16 and must not be collected here before that workflow
> exists. Enquiries attach to a `Party`, which carries both buyer and seller roles
> on one record.

### Implement

- general inquiry
- vehicle inquiry
- export quote
- appointment request
- call/contact request
- source request

### Form principles

- progressive disclosure
- clear validation
- useful error messages
- accessible labels
- server-side validation
- spam protection
- rate limiting
- success confirmation
- retry-safe submission

### Attribution — capture it here or never

Every enquiry record carries two field sets: a **first-touch** set written once and
never overwritten, and a **last-touch** set overwritten each session. Both hold
source, medium, campaign, referrer, landing page and click identifiers including
`gclid`, plus any `referral_code`. Capture is **server-side**, read from the request.

This is not analytics. This business converts on a LINE thread, a telephone call or a
yard visit, days or weeks after the click — there is no checkout to attribute
against, so the stored click identifier is the only thing that can ever tie a deal
back to the advertising that produced it.

**It cannot be backfilled.** A record created without these fields is permanently
unattributed, which is why it lands at M6 with the first enquiry rather than at M14
with accounts.

Count enquiries per item while doing so: it feeds the `enquiries_desc` sort in Phase
4 and the stock-ageing signal in internal operations.

See Brief §58b and Architecture §5.

### Reliability

Do not depend on a single third-party service for successful lead capture.

Where appropriate:

1. validate
2. persist
3. enqueue notifications
4. send external notifications
5. record delivery status

### Exit criteria

- Leads are not silently lost.
- Duplicate submissions are controlled.
- Validation works on server and client where appropriate.
- Errors are recoverable.

---

# 12. Phase 8 — Acquisition (買取): intake, valuation, offer

**Milestone M2. This is the first capability the business gets, and the most
valuable record it creates.**

## Goal

Let staff turn an unstructured seller conversation into a structured unit record,
value it, make an offer, and record the outcome — whether or not the company buys.

### The rule that defines this phase

**A unit record is created at first seller contact, not at purchase.** An item that
was offered and declined is a complete `InventoryItem` whose lifecycle ended at
`DECLINED`. There is no separate lead or valuation-request table, and no handoff
into inventory at purchase.

The reason is the linkage. The handoff is exactly where the connection between
offer price, purchase price and eventual sale price is lost. Within roughly a year
this produces a private dataset of what the company was offered, what it paid, and
what each unit later sold for. No competitor can buy it, every future
valuation-assistance capability depends on it existing, and it accumulates only
forward — a decision taken later starts from zero.

### Flow — internal, Japanese-first

1. **Contact recorded** — `OFFERED`. Origin channel captured on the record (LINE,
   phone, web, walk-in). LINE is likely the primary seller channel; the field is
   recorded from day one even though the integration is deferred to M9.
2. **Identification and specifications** — category selects the specification
   schema; structured values stored as reference-table keys, never as display text.
3. **Condition and history**, with photographs.
4. **Valuation** — `VALUED`. The figure produced, who produced it, and when.
5. **Offer made to the seller**, and the figure recorded.
6. **Outcome** — `DECLINED` (terminal, retained permanently, with a reason) or
   `PURCHASED` with the purchase price and collection date.
7. **Collection**, then `DRAFT` and handover to stock operations (M3).

### 出張査定 — on-site appraisal booking

An excavator cannot be driven to an office, and whether a visitable yard exists is an
open question. For machinery this is not an option on the flow above; it *is* step 2.

Capture location and site access, whether the machine can be started or moved,
preferred windows rather than one fixed slot, and the assigned appraiser — recorded
on the unit. A request left at 23:00 is triaged the next morning without loss.

### Referral capture

Seller intake records `referral_code` from the introducing 整備工場, 板金業者,
解体業者 or contractor. Accrual is modelled; **payout does not ship until the 紹介料
policy and its tax treatment are answered** (Phase 0).

### Requirements

- Messages arriving at 23:00 and triaged the next morning must not be lost. A web
  form is not the primary intake path; most acquisitions begin as an unstructured
  conversation, and the system must let staff structure it rather than force
  sellers into a form.
- Every state transition is audit-logged with actor, timestamp and before/after.
- Purchase price, valuation and decline reason are internal fields and must never
  reach a public response.
- Secure uploads: type validation, size limits, safe storage names, malware
  scanning where infrastructure supports it, EXIF/privacy handling, rate limiting.
- Seller personal data is retained permanently on `DECLINED` records. **This
  requires a stated lawful basis and a retention notice before the first real
  seller record is created** — see the open question below.

### A public "sell your vehicle" form is a later, secondary surface

It feeds the same record in `OFFERED`; it does not get its own table, its own
pipeline, or its own lifecycle.

### Exit criteria

- A seller conversation becomes an `InventoryItem` in `OFFERED` in under a minute.
- `OFFERED → VALUED → DECLINED` and `→ PURCHASED` are all recorded, audit-logged,
  and never publicly visible.
- Offer price, purchase price and sale price remain linked on one record for the
  life of the unit.
- Declined records are retained and queryable.
- Staff can work the whole flow in Japanese.
- Backups cover this data and a restore has been verified.

> **Revision 2.** This phase previously specified an 11-step public "Sell Your Car /
> Trade-In" form ending at "Confirmation", exiting on mobile completion and upload
> recovery. It created no unit record, no `OFFERED` or `VALUED` state, no offer
> price and no decline retention — it was a lead-capture form, which is precisely
> the alternative ADR 0001 Decision 1 rejected. Building it as written would have
> discarded the dataset that motivated this entire revision. See ADR 0001
> Decision 1, and Architecture §6 and §9.

---

# 13. Phase 9 — Japanese Auction Sourcing

## Goal

Build sourcing as a structured business workflow rather than a simple contact form.

> **Revision 2. Milestone M16 — after launch, and demand-driven.** Promote it only
> when enquiry volume shows the need. Nothing in M4–M13 may present sourcing as an
> available service, and auction access must never be implied without verified
> business capability.

### Request fields

Where supported:

- Make
- Model
- Year
- Budget
- Mileage
- Preferred grade
- specifications/preferences
- destination
- customer contact

### Workflow

1. Request submitted
2. Request validated
3. Request stored
4. Auction/search process
5. Candidate found
6. Inspection/report
7. Quote
8. Customer approval
9. Purchase
10. Preparation
11. Export
12. Delivery

### Architecture

Auction integrations must be isolated behind stable interfaces.

Do not let vendor-specific APIs leak throughout the application.

### Exit criteria

- Sourcing requests are trackable.
- Vendor failures do not crash the public website.
- Future auction providers can be added without rewriting the domain.

---

# 14. Phase 10 — Export & Delivery

## Goal

Make international purchasing understandable without making unsupported promises.

> **Revision 3. Milestone M7.** Export is a confirmed capability (ADR 0002 Decision
> 1), so this is an active specification rather than a conditional one. Destination
> countries remain an open question — a confirmed capability is not a confirmed
> destination list, and §2.1 still forbids publishing routes the business cannot
> service.

### Implement

- destination selection
- shipping information
- export process
- documentation information
- quote request
- status tracking where data exists
- **delivery terms** — Incoterms 2020 keys, constrained by carriage mode. The code is
  `CFR`; the ampersand form reference exporters still print was retired from the ICC
  rules. See Architecture §10.
- **pre-shipment inspection** as a document artefact with an issuing body, date and
  result. JEVIC, QISJ and EAA inspections include a radiation test and the company
  operates in Ibaraki — this is not a generic checkbox for this seller.
- **bank and telegraphic-transfer details page**, domestic and export blocks,
  including who bears the transfer charges. Values are supplied and verified by the
  company; none exist in this corpus. See Brief §32b.
- **buyer-visible document pack** — a scoped, authenticated view of the released
  documents on a deal (Architecture §65).
- **heavy haulage** for domestic machinery delivery: trailer type, 特殊車両通行許可
  and its lead time, and who unloads (Brief §42b).

### Pricing

Keep distinct:

- vehicle price
- export-related costs
- shipping
- destination-related estimates
- taxes/duties where explicitly verified

Do not claim exact landed cost unless authoritative calculation/data exists.

### Exit criteria

- Export flow is transparent.
- Unsupported costs are not fabricated.
- Quote requests reach the appropriate workflow.
- Country/port data is extensible.

---

# 15. Phase 11 — Favorites, Comparison & Customer Accounts

## Goal

Support high-intent shoppers without forcing account creation too early.

> **Revision 2. Milestone M14 — after launch, and demand-driven.** Favourites
> nonetheless appears in the M4 shell, on the M5 detail page and in the E2E suite.
> Either it moves earlier by explicit decision, or those three surfaces must not
> render it. Do not ship a control that does nothing.

### Favorites

Support:

- guest favorites where feasible
- authenticated favorites
- persistence
- removal
- empty state
- inventory availability changes

### Comparison

Support a limited, useful comparison set.

Avoid:

- huge comparison matrices
- excessive fields
- unreadable mobile tables

### Accounts

Potential capabilities:

- saved vehicles
- saved searches
- inquiries
- sourcing requests
- export requests
- appointments
- profile

Build only what is required by the actual business workflow.

### Exit criteria

- Account functionality does not unnecessarily block anonymous browsing.
- Authentication boundaries are secure.
- Favorites remain performant.

---

# 16. Phase 12 — Admin / CMS / Operations

## Goal

Make business operations manageable without developer intervention for routine content.

> **Revision 2. Split across M3 and M15.** Internal stock operations — status
> changes, media pipeline, preparation — are M3 and are what the business runs on
> from the moment M2 starts producing records. Admin depth and bulk operations are
> M15, after launch. The module list below still separates "vehicle media" from
> "equipment"; they are one entity with one media model, differing only in which
> specification schema applies.

### Potential modules

- inventory
- vehicle media
- equipment
- inspections
- auction reports
- inquiries
- leads
- sourcing requests
- export requests
- appointments
- reviews
- journal/content
- site settings

### Inventory lifecycle

The lifecycle is defined once, in Architecture §9, and is not restated or varied
per surface:

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

`OFFERED`, `VALUED`, `DECLINED` and `PURCHASED` are never publicly visible. Only
`AVAILABLE` and `RESERVED` appear in the public catalogue. `DECLINED` records are
retained permanently. Do not add further statuses without a recorded decision.

> **Revision 2.** This section previously proposed `draft / pending review /
> active / reserved / sold / archived` and told the reader to defer to "the
> existing system". Neither `pending review` nor `active` exists anywhere else in
> the corpus, and there is no existing system. See ADR 0001 Decision 1.

### Auditability

Record important administrative changes.

Examples:

- price changed
- status changed
- inventory published
- media replaced
- inspection updated
- lead status changed

### Exit criteria

- Routine operational updates do not require code changes.
- Critical changes are auditable.
- Admin authorization is enforced server-side.

---

# 17. Phase 13 — AI-Ready Architecture

## Goal

Prepare the platform for AI without making AI a dependency for core commerce.

### Initial AI capabilities

Potential future features:

- natural-language vehicle search
- conversational vehicle discovery
- vehicle recommendations
- comparison assistance
- inventory Q&A
- multilingual assistance between EN/JP
- lead qualification
- content assistance

### AI truth policy

AI must never invent:

- vehicle specifications
- availability
- pricing
- inspection results
- legal information
- shipping costs
- ownership history

AI answers must be grounded in authoritative application data.

### Architecture

Use an AI abstraction layer so the application is not tightly coupled to one model/provider.

Potential flow:

`User → AI orchestration → retrieval → authoritative inventory/data → model → validated response`

### Failure behavior

If AI is unavailable:

- normal search continues
- inventory continues
- contact continues
- core website continues

AI is an enhancement, never the foundation.

---

# 18. Phase 14 — SEO & AI Discovery

## Goal

Make inventory and business content discoverable through traditional search and emerging AI interfaces.

### Implement

- semantic HTML
- metadata
- canonical URLs
- sitemap
- robots rules
- Open Graph
- structured data
- vehicle/item schema where appropriate
- organization/local business information where valid
- breadcrumb schema
- image metadata
- indexable inventory pages
- useful editorial content

### URL principles

URLs should be:

- stable
- human-readable
- language-aware
- canonical
- shareable

Avoid query parameters for permanent identity.

### Exit criteria

- Crawlability is verified.
- Canonicals are correct.
- Structured data validates.
- No accidental noindex directives exist.

---

# 19. Phase 15 — Accessibility

## Goal

Meet a strong accessibility baseline, targeting WCAG 2.2 AA practices where applicable.

### Test

- keyboard navigation
- focus visibility
- semantic headings
- form labels
- error announcements
- contrast
- screen reader semantics
- modal focus management
- mobile touch targets
- reduced-motion preference
- image alt text
- accessible tables/comparisons

### Exit criteria

No critical accessibility blocker remains on primary journeys.

---

# 20. Phase 16 — Performance Engineering

## Goal

Make speed a product feature.

### Core priorities

- fast server response
- minimal JavaScript
- optimized images
- responsive image sizes
- CDN caching
- route-level caching
- database query efficiency
- reduced API payloads
- streaming where appropriate
- lazy loading
- prefetch only when useful
- background processing

### Image policy

Use:

- AVIF/WebP where supported
- responsive `srcset`
- explicit dimensions
- LQIP/blur placeholders where appropriate
- lazy loading below fold
- priority loading only for true LCP content

### Database

Watch for:

- N+1 queries
- missing indexes
- oversized SELECTs
- repeated queries
- unnecessary joins
- inefficient search patterns
- unbounded result sets

### Performance budgets

Initial targets should be measured against the actual application and refined after baseline profiling.

Suggested goals:

- LCP: ≤ 2.5s on representative mobile conditions
- INP: ≤ 200ms
- CLS: ≤ 0.1
- minimal blocking JavaScript
- no avoidable layout shifts
- inventory API response targets defined from real production measurements

These are targets, not excuses to hide functionality.

### Required process

Before optimization:

1. measure
2. identify bottleneck
3. optimize
4. measure again
5. document result

---

# 21. Phase 17 — Security Hardening

## Goal

Protect customers, business data, infrastructure, and integrations.

### Areas

- authentication
- authorization
- session security
- CSRF protection where applicable
- input validation
- output encoding
- SQL injection prevention
- XSS prevention
- upload security
- rate limiting
- bot/spam protection
- secrets management
- CORS
- security headers
- dependency auditing
- webhook verification
- API abuse controls
- audit logging

### Important

Security must be enforced server-side.

Never rely on frontend controls for authorization.

---

# 22. Phase 18 — Testing Strategy

## Testing pyramid

### Unit

Test:

- domain rules
- validation
- formatting
- utility functions
- pure components where valuable

### Integration

Test:

- API contracts
- database interactions
- forms
- authentication
- inventory queries
- lead submission
- file uploads

### E2E

Prioritize business-critical journeys. Ordered by the milestone that delivers
them, so the suite is never written against unbuilt features:

**Internal — these run the business and ship first**

1. Acquisition: record seller contact → `OFFERED` → `VALUED` → offer → `DECLINED`,
   in Japanese (M2)
2. Acquisition: → `PURCHASED` → collection → `DRAFT`, with offer, purchase and
   later sale price still linked on one record (M2)
3. Stock operations: `DRAFT` → media upload → `AVAILABLE`, and withdrawal (M3)
4. Internal fields — purchase price, valuation, decline reason — never appear in a
   public response (M2–M5)

**Public — at launch**

5. Browse catalogue (M5)
6. Search and filter, including a Japanese-language query (M5)
7. Open a stock item (M5)
8. Contact about a stock item (M6)
9. Deal document pack: checklist instantiated by type + destination, and correctly
   reporting what is still missing (M7)

**Added in Revision 3**

10. **Sort determinism** — paging through a sorted result returns every record once
    and none twice, including where many items share a sort value (M5)
11. **NULL placement** — an item with no operating hours does not lead `hours_asc`
    (M5)
12. **Alias search** — a query for ユンボ returns records stored as
    `hydraulic_excavator` (M5)
13. **LINE deep link** — the token in the pre-filled message survives into the
    attribution record for that listing (M5–M6)
14. **First-touch immutability** — a visitor arriving twice from different campaigns
    keeps the original first-touch values and gains new last-touch values (M6)
15. **Settlement** — invoice issued, part-paid by transfer and manually reconciled,
    then completed; a replayed gateway callback does not double the payment (M7)
16. **Delivery-term validity** — `CFR` cannot be selected on a road delivery (M7)
17. **Machinery document route** — a non-road-registered machine's checklist contains
    売買契約書 and 譲渡証明書 and does not mention 名義変更 (M7)

**Post-launch — write these when the milestone lands, not before**

10. Favourites (M14) · export quote (M10) · auction sourcing (M16) · account flow (M14)

> **Revision 2.** All nine journeys were previously buyer-side public web, and four
> of them tested post-launch milestones — so at the M13 launch, roughly half the
> suite covered features that did not exist while the internal system the business
> actually runs on had no end-to-end coverage at all. There was no Japanese-language
> journey despite bilingual being a data-model commitment. "Open vehicle" was
> renamed: there is one entity and one detail template.

### Visual regression

> **Revision 2.** Deferred until a design system exists. Snapshotting six page types
> while tokens and components are still being promoted on second use produces churn
> that gets force-updated until it means nothing — the same failure mode ADR 0001
> Decision 5 avoided for components. Introduce it once M4 has settled.

When introduced, use for:

- homepage
- catalogue
- stock item detail
- major responsive states
- global header/footer
- the internal acquisition and stock screens, which ship first and were previously
  given no visual coverage at all

### Performance testing

Test:

- cold load
- warm load
- mobile
- slow network
- large inventory
- high concurrent read traffic
- expensive search
- media-heavy detail pages

---

# 23. Phase 19 — Observability & Reliability

## Goal

Know what the system is doing in production.

### Monitor

- server errors
- API latency
- database latency
- slow queries
- cache hit rate
- search latency
- image failures
- form submission failures
- authentication failures
- background job failures
- third-party integration failures
- uptime

### Logging

Logs must be:

- structured
- searchable
- privacy-conscious
- useful for debugging

Never log passwords, tokens, payment credentials, or unnecessary personal information.

### Alerts

Alert on meaningful failures, not every harmless warning.

---

# 24. Phase 20 — Deployment & Release Engineering

## Goal

Make releases predictable and reversible.

### Requirements

- reproducible builds
- environment separation
- secret management
- database migration strategy
- health checks
- rollback plan
- deployment logs
- backups
- recovery procedure
- CI validation

### Environments

At minimum:

- development
- staging
- production

Where infrastructure supports it, preview environments may be used for UI work.

### Database migrations

Rules:

- migrations are version-controlled
- destructive migrations require explicit review
- backwards-compatible migration patterns are preferred
- data migrations are separated from schema changes where useful
- rollback/recovery implications are understood before production deployment

---

# 25. Phase 21 — Launch Readiness

Before production launch, verify:

## Product

- all primary navigation works
- inventory works, and every offered sort pages without duplicating or dropping
- stock item details work
- contact works, including the LINE deep link and its desktop fallback
- export works
- payment can be requested, received and reconciled
- sell/trade-in works if enabled
- sourcing works if enabled
- mobile flows work

## Legal — blockers, not checks

- 特定商取引法に基づく表記 published and confirmed by someone qualified in Japan
- 古物商 details displayed per Brief §2b
- bank and transfer details verified with the company, with the standing notice that
  they are never changed by message
- 返品特約 stated

## Data

- no placeholder content remains
- prices are correct
- inventory status is correct
- images are correct
- legal information is verified
- company information is verified

## SEO

- sitemap
- robots
- canonicals
- metadata
- structured data
- social previews

## Accessibility

- keyboard
- screen reader basics
- contrast
- focus
- forms
- mobile

## Performance

- production build
- real-device testing
- mobile testing
- image audit
- JS bundle audit
- API latency
- database queries

## Security

- secrets
- headers
- authorization
- uploads
- rate limits
- dependency audit

## Operations

- monitoring
- alerts
- backups
- rollback
- error tracking

---

# 26. Phase 22 — Post-Launch Optimization

The project does not end at launch.

### First 30 days

Monitor:

- search behavior
- inventory engagement
- vehicle detail engagement
- lead conversion
- mobile abandonment
- errors
- slow routes
- failed integrations

### First 90 days

Improve:

- search relevance
- filters
- inventory presentation
- lead forms
- export workflow
- SEO content
- performance bottlenecks

### Long-term

Evaluate:

- AI discovery
- recommendation systems
- partner APIs
- mobile application
- customer portal
- richer inventory data
- automated inspection ingestion
- advanced analytics

Only build features supported by measured business value.

---

# 26b. Phase 23 — Payments & Settlement

**Milestone M7, alongside deal document packs. Settlement and paperwork are the same
event.**

## Goal

Record what is owed against a deal, and what has actually arrived, whatever route it
came by.

### The ledger is the deliverable

`Invoice` and `Payment` against a `Deal`, with `SettlementMethod` as a reference
table: 銀行振込, telegraphic transfer, card, escrow. Adding a method must never
require a schema change. Architecture §44b holds the model.

**Manual reconciliation is a first-class path, not an admin afterthought.** Most money
will arrive as a bank transfer that no webhook announces and a person will match it
to an invoice. Record who matched it and when.

### Card acceptance

In scope by business decision. The trade-off is recorded rather than argued: card
fees on vehicle-value transactions are material and cross-border chargebacks on
high-value goods are a real exposure. Three consequences are not optional:

- **No card number ever reaches our systems.** Hosted fields or hosted checkout only —
  none at rest, in logs, in analytics or in support tooling.
- **3-D Secure on every cross-border capture.**
- **Idempotency keys on every write.** Gateway callbacks retry; a repeated callback
  must never double a payment, a refund or a commission accrual.

### Blocked on

- the gateway ADR (Phase 0)
- the 特商法 page, which becomes required the moment payment methods are published
  (Brief §2b) — a launch blocker on this phase specifically
- the 返品特約 policy, which 特商法 requires us to state

### Exit criteria

- An invoice can be issued, part-paid, fully paid, and reconciled by a named actor.
- A bank transfer with no webhook can be matched manually and audited.
- A repeated gateway callback does not double anything.
- No card number appears anywhere in the database, logs or error reports.
- Internal settlement fields never reach a public response.

---

# 26c. Phase 24 — Guides & Structured Explainers

**Milestone M8, with the homepage.**

## Goal

Explain the three buying routes without publishing anything the business cannot do.

### Structured, not prose

Author the steps and required documents as **records**, so the same source drives the
customer-facing guide and the deal document checklist in Architecture §65. When a
required document changes, it changes once.

Three routes, per Brief §80b:

1. **買取** — 相談 → 査定 → 提示 → 成約/お断り → 書類 → 入金 → 引取
2. **Domestic purchase** — 見積 → 契約 → 書類 → 入金 → 名義変更 → 納車, with
   印鑑証明書 within 3 months, 車庫証明 at 3–7 business days, and 移転登録 filed
   within 15 days. **Machinery without road registration has no 車検証 and no
   名義変更** — it transfers on 売買契約書 and 譲渡証明書, so the route resolves from
   category *and* registration status.
3. **Export purchase** — quote → invoice → payment → 輸出抹消登録 → inspection where
   required → booking → shipment → documents released.

### Shipping and terms explainer

RoRo versus container; domestic haulage for machinery; what each delivery term
includes and where responsibility transfers; the document set and who holds each
item. Written in our own words — the Incoterms rules are ICC copyright, so reference
the codes and explain them ourselves.

### i18n

Steps and document names are class 2 (reference keys, rendered in either language).
Only the explanatory prose is class 3, authored natively in both. Keep class 3 small.

### Exit criteria

- Guide content and the deal checklist derive from one source.
- The machinery route is reachable and does not mention 名義変更.
- No duty, tax or landed cost is stated that the business cannot compute (§2.1).

---

# 27. Performance Budget & Engineering Scorecard

| Area | Target / Rule |
|---|---|
| LCP | ≤ 2.5s target on representative mobile |
| INP | ≤ 200ms target |
| CLS | ≤ 0.1 target |
| JavaScript | Minimize; no unnecessary client bundles |
| Images | Responsive + modern formats |
| API | Avoid oversized responses |
| Database | No unbounded queries |
| Search | Measured latency under realistic inventory size |
| Accessibility | Strong WCAG 2.2 AA baseline |
| SEO | Crawlable, canonical, structured |
| Security | Server-side authorization + validated input |
| Reliability | Optional dependencies degrade gracefully |

Targets must be validated with real measurements.

---

# 28. Definition of Done

A feature is **Done** only when:

- functionality works
- UI matches design system
- mobile works
- accessibility is acceptable
- loading/error/empty states exist
- validation exists
- security implications are handled
- API contracts are stable
- tests cover important behavior
- production build succeeds
- performance impact is understood
- SEO implications are handled where applicable
- no unnecessary duplication is introduced
- documentation is updated where architecture changed

---

# 29. Claude Code Operating Protocol

Claude Code should operate as a senior engineer, not as a blind code generator.

## Before coding

1. Read, in this order:
   - `docs/decisions/0001-lifecycle-and-scope.md` — **read first.**
   - `docs/decisions/0002-commerce-capabilities.md` — **read second.** Together these
     ADRs supersede earlier revisions of all three documents below. Where an ADR
     conflicts with any of them, the ADR wins.
   - `MAS_SONS_MASTER_DESIGN_BRIEF.md`
   - `MAS_SONS_PROJECT_ARCHITECTURE.md`
   - `MAS_SONS_IMPLEMENTATION_PLAN.md`
   - any later ADR in `docs/decisions/`
2. Inspect the repository as it actually is.
3. Understand existing behavior.
4. Identify dependencies.
5. Identify risks.
6. Determine the smallest safe implementation slice.

## During coding

- Make focused changes.
- Reuse existing patterns.
- Avoid unrelated refactors.
- Keep change sets coherent.
- Validate after each meaningful change.
- Do not silently change business logic.
- Do not create fake data to make UI look complete.

## After coding

Run applicable:

- typecheck
- lint
- unit tests
- integration tests
- E2E tests
- production build
- performance checks

Then report:

- what changed
- why
- files changed
- tests run
- results
- remaining risks
- next recommended step

---

# 30. Stop Conditions

Claude Code must stop and ask for direction when:

- business rules conflict
- required data is unavailable
- an existing API is ambiguous
- a destructive database migration is required
- authentication behavior is unclear
- legal/compliance information is missing
- an external integration contract is uncertain
- the requested change would break an existing workflow
- major architecture needs to change
- a requirement conflicts with the design brief

Do not guess through high-impact ambiguity.

---

# 31. Anti-Patterns

Never:

- rebuild the entire application blindly
- replace working architecture without evidence
- introduce microservices prematurely
- hardcode inventory data
- fake API responses in production code
- use client state for server truth
- load all inventory into the browser
- create N+1 queries
- ship oversized images
- add unnecessary UI libraries
- add excessive animation
- duplicate components
- ignore mobile
- ignore accessibility
- hide errors
- expose internal API data publicly
- trust client-side authorization
- couple the entire application to an AI provider
- claim performance improvements without measurements

---

# 32. Recommended Milestone Sequence

| Milestone | Primary Outcome |
|---|---|
| M0 | Decisions answered, repository scaffolded, CI green |
| M1 | Core records + bilingual reference tables + staff auth + audit log |
| M2 | Purchase intake and valuation, Japanese-first |
| M3 | Internal stock operations, status changes, media pipeline |
| M4 | Design tokens + global shell + primitives proven by M2–M3 |
| M5 | Public bilingual catalogue, search, detail pages |
| M6 | Enquiry and contact workflows |
| M7 | Deal document packs **and settlement** — domestic and export |
| M8 | Homepage **and the buying-process guides** |
| M9 | LINE integration and notifications |
| M10 | SEO / accessibility |
| M11 | Performance and security hardening |
| M12 | Production readiness |
| M13 | Launch |
| M14 | Favorites / compare / customer accounts |
| M15 | Admin depth, bulk operations, referral payout |
| M16 | Auction sourcing |
| M17 | AI-ready capabilities, 概算査定 once the offer/sale dataset supports it |
| M18 | Continuous optimization |

M14–M17 are demand-driven, not scheduled. Promote one only when usage shows the
need. Launching at M13 with real inventory beats launching at M18 with features
nobody has asked for.

---

# 33. Architecture Evolution Policy: 2026–2036

The platform should evolve without forcing a rewrite.

### 2026–2027

Focus on:

- excellent inventory
- search
- mobile UX
- conversion
- export
- operational tooling
- performance

### 2027–2029

Potentially add:

- richer accounts
- saved searches
- recommendations
- AI search
- advanced analytics
- partner integrations

### 2029–2032

Evaluate:

- dedicated search infrastructure
- specialized media processing
- advanced recommendation services
- mobile applications
- broader partner APIs

### 2032–2036

Extract services only where scale, team boundaries, reliability, or operational needs justify it.

**Do not design today's system around hypothetical 2036 microservices.**

The correct strategy is:

> **Strong modular boundaries today; selective extraction only when justified tomorrow.**

---

# 34. Final Engineering North Star

M.A.S & SONS should feel like a premium Japanese automotive business, but technically behave like a modern, resilient digital platform.

The final system should be:

**Fast enough to feel immediate.**  
**Clear enough to inspire confidence.**  
**Structured enough to scale.**  
**Flexible enough to evolve.**  
**Simple enough to maintain.**  
**Reliable enough for real business operations.**

The goal is not maximum technology.

The goal is **maximum useful capability with minimum unnecessary complexity**.

---

## Final Non-Negotiable Rule

> **Do not optimize for how much code is written. Optimize for how much reliable business capability is delivered per unit of complexity.**
