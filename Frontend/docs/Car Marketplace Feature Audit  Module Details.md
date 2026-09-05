# MAS & SONS — Export Platform Feature Spec

What belongs in each module, built against the actual business (confirmed against the client's
business card and their own reference site, nippon vehicles.com) and the real competitive set:
**Nippon Vehicles, BE FORWARD, SBT Japan, TCV (Tradecarview), CarFromJapan** — not domestic consumer
marketplaces like Goo-net/Carsensor, and not UK/US retail platforms like Auto Trader/CarGurus/Cazoo.

## The Business Model, Stated Plainly

MAS & SONS is a **single-company Japan-based exporter**, not a multi-dealer marketplace:

- **Supply side (domestic, Japanese)**: buys used cars and heavy equipment from Japanese sellers —
  the business card's loud "年式に関係なく高価買取りいたします" (high-price buyback regardless of
  model year) pitch. This can stay a mostly offline/LINE/phone process; it doesn't need heavy web
  investment, but a simple Japanese-language "sell to us" page captures inbound leads MAS & SONS
  would otherwise miss.
- **Distribution side (international, English)**: sells that Japan-sourced inventory — cars *and*
  heavy machinery — to overseas buyers via FOB/C&F/CIF quotes and shipping to their port. **This is
  the actual website.**

There is no "dealer" entity per listing, no multi-seller aggregation, no dealer ratings — every unit
is MAS & SONS' own stock. That single fact removes or reshapes most of a generic marketplace spec.

---

## Auth & Account Access

Export buyers don't need a heavyweight account to get a quote — friction here directly costs leads.

- **No login required** to: browse stock, view a listing, view specs/photos, submit a quote request,
  submit a "Request a Car" custom-sourcing inquiry, start a WhatsApp/LINE chat.
- **Account (optional, lightweight)** unlocks: saved stock/favorites, saved search alerts, a history
  of past quote requests and orders — email + password or a passwordless email code; Google login is
  worth it given how international the audience is.
- **No identity verification at signup.** Collect passport/ID and shipping details only once an order
  is actually being placed — matching how the real competitors (BE FORWARD, SBT, Nippon Vehicles)
  operate: quote and inquire freely, verify at the point of an actual transaction.
- The **domestic seller-facing buyback page** is separate and simpler still: name, phone, vehicle
  details, photos — no account at all, just a lead form feeding straight to LINE/phone follow-up.

---

## Inventory & Browse

**Two co-equal top-level catalogs, not one with a hidden second category** — the business card is
explicit that heavy equipment (excavators, bulldozers, tractors, crane trucks, dump trucks,
trailers) is core inventory, not an afterthought:

- **Vehicles**: cars, vans, trucks, buses — matches Nippon Vehicles' actual catalog.
- **Heavy & Industrial Equipment**: excavators, wheel loaders, bulldozers, tractors, forklifts,
  dump trucks, cranes, trailers.

**Condition tiers**: Used is the entire business — there's no "New" or "Certified Pre-Owned" tier to
segment (this isn't a franchise-dealer model). Segment instead by **auction grade** (see Vehicle
History below), which is the real quality signal in this industry.

**Curated entry points**: browse by make, by body type, by destination country/port (a genuine SEO
and conversion asset — "used cars for export to Kenya," "excavators for export to Tanzania" are real
searches with real commercial intent), by price band in USD.

**Scale signals**: total stock count and per-category counts on category tiles — same reasoning as
any inventory business, builds confidence in depth of selection.

---

## Search & Filters

**Core filters:**
- Make, model
- Year (range), Price (range, **USD**), Mileage (range, **km**)
- Body type, fuel type, transmission
- **Steering position (LHD/RHD)** — not a UK/US-marketplace filter, but essential here: many
  destination markets require left-hand-drive, some require right-hand-drive; this filter has real
  commercial consequence and should be prominent, not buried.
- Engine displacement/CC (Japan measures and taxes this way; buyers researching import duty in their
  own country need it)

**Differentiating filters that actually matter for this business:**
- **Auction grade** (5 / 4.5 / 4 / 3.5 / 3 / R / RA — the real, widely-recognized Japanese auction
  condition scale) as both a filter and a default sort signal — this is the single most trusted
  quality indicator in the whole industry, far more than a generic "deal rating."
- **Repair/accident history** (修復歴 disclosure, translated) — include/exclude/show-only.
- Free-text keyword search across the equipment/vehicle description.
- Destination-country filter, if shipping cost/eligibility genuinely varies enough to matter.

**Sort options**: newest listed, price low-high/high-low, mileage, auction grade.

**Result presentation**: numbered pagination at scale (thousands of units of stock, same reasoning
as any large-inventory site); each card carries price (USD), auction grade badge, mileage, steering
position, and a thumbnail gallery count.

**Saved search + alerts**: a real, valuable feature here — an overseas buyer waiting for a specific
model/grade/price combination to appear in stock is a genuine, common use case worth building
properly, uncapped (don't limit to one saved search per make/model).

**Not needed from the generic playbook**: monthly-payment/financing search (no consumer financing in
this model), private-seller-vs-dealer filter (there's only one seller: MAS & SONS), map view (buyers
aren't visiting in person).

---

## Listing Detail Page

**Media**: full photo gallery per unit — for used-vehicle export specifically, buyers who will never
see the vehicle in person before it ships rely heavily on photo count and quality; more photos,
covering more angles (engine bay, undercarriage, interior wear, odometer reading itself
photographed) is a direct trust and conversion lever, more so than in a domestic marketplace where a
buyer can just go look at the car.

**Header block**: title, price (USD, with a visible "+ shipping to your country" note rather than a
misleadingly bare sticker price), auction grade badge.

**Spec sheet**: mileage (km), engine/CC, fuel type, transmission, drivetrain, steering position,
first-registration year, chassis/VIN.

**Vehicle history & trust box** — this is the single most important trust surface on the page, more
so than in a domestic marketplace, precisely because the buyer cannot inspect the unit themselves:
- Auction sheet summary (grade, inspector's condition notes, interior/exterior diagram markings)
  translated into plain English.
- Repair/accident history (修復歴), mileage-verification note, one-owner status if known.
- A photographed odometer reading — mileage fraud is a known industry concern; showing the actual
  instrument photo is a credibility signal competitors don't all bother with.

**Primary calls to action**: "Get a Quote" (FOB/C&F/CIF, destination-port aware), "Request Similar"
if this unit sells before the buyer commits, WhatsApp/LINE chat, "Add to Compare." No "reserve with a
deposit," no financing calculator, no dealer-message button — there's no dealer, and deposit-based
holds aren't how this transaction actually closes (a quote-and-invoice flow is).

**Cross-sell**: "Similar stock" (same category/grade/price band) — there's no "more from this seller"
distinction to make, since every listing is the same seller.

**Utility actions**: save/favorite, share, print the spec sheet (buyers often forward listings to a
shipping agent or a business partner for approval before committing).

---

## Vehicle History & Trust

This entire module is reframed around the actual trust problem in vehicle export: **the buyer can't
inspect the unit, and the industry has real fraud exposure (odometer rollback, misrepresented
condition, and outright non-delivery scams).** Trust infrastructure is a competitive weapon here, not
a compliance checkbox:

- **Auction sheet transparency**: publish the real auction inspection sheet (or a faithful
  translation/summary of it) per unit — grade, condition notes, diagram markings. This is Japan's
  own, internationally recognized quality-assurance system; leaning on it (rather than a
  UK-style write-off/salvage category system that doesn't apply here) is both more honest and more
  credible to buyers who already know how Japanese auctions work.
- **古物商許可 (secondhand dealer license) number** displayed clearly, same as the business card —
  it's a real legal credential and a differentiator against unlicensed operators.
- **Payment/banking transparency page**: how wire transfers work, what to expect, red flags to watch
  for — the single highest-anxiety moment in this transaction is wiring a large sum internationally
  before receiving the vehicle. Addressing this directly, rather than leaving it implicit, is a
  genuine trust-building move the biggest players (BE FORWARD, SBT) invest in heavily.
- **Testimonials from actual past buyers**, ideally by destination country — "bought from MAS & SONS,
  delivered to Mombasa" is a far stronger signal to a Kenyan buyer than a generic star rating.
- JUMVEA (Japan Used Motor Vehicle Exporters Association) membership, if applicable — worth pursuing
  if not already a member; it's exactly the kind of verifiable industry credential that offsets
  "small operator" risk perception against the giant platforms.

**Not applicable from the generic playbook**: UK-style Cat C/D/S/N write-off categories (don't exist
in this framework), GAP coverage (not a standard product here — verify with a local insurer before
ever proposing it), platform-wide return-window guarantees (not how export sales work).

---

## Comparison Tools

A real side-by-side comparison (pick 2–3 units from stock, compare spec/price/grade in one table) is
worth building — it's a genuine differentiator in the broader used-vehicle space and maps naturally
onto a buyer's actual decision process here (comparing 2–3 similar-grade units before committing to
an international purchase is exactly what a careful overseas buyer does). Keep it simple: a compare
tray plus a table, not an elaborate UI investment on day one.

---

## Contact / Lead-gen — the Core of the Business

This is not a peripheral module here; it *is* the primary function of the site, alongside Browse
Stock:

- **Get a Quote** (per listing): destination country/port selector, Incoterm (FOB/C&F/CIF), name,
  contact method (email/WhatsApp/phone) — matches Nippon Vehicles' actual flow.
- **Request a Car**: the buyer describes what they want (make/model/year/budget) when nothing in
  current stock matches, and MAS & SONS sources it via auction — a genuine differentiator for buyers
  with specific requirements, and a real feature on the reference site worth replicating faithfully.
- **WhatsApp and LINE integration** — WhatsApp for international buyers, LINE for domestic sourcing
  contacts; both already appear on the business card/reference site, so this isn't speculative.
- **Availability confirmation**: since auction-sourced stock can sell at auction to someone else
  before a quote is finalized, be explicit about stock status (in-stock vs. "source on request") to
  avoid the "ghost listing" frustration that damages trust in this industry.

---

## Reviews & Ratings

Single-seller model — there's no dealer to rate. One system only:

- **Company-level reviews**, ideally segmented by destination country (a Kenyan buyer trusts a
  Kenyan buyer's review more than a generic 5-star average).
- A third-party trust badge (Trustpilot or similar) surfaced across the funnel, not just on one page
  — this is how the major competitors offset the inherent "wiring money overseas" anxiety.

---

## Notifications & Alerts

- **Saved-search / new-stock alerts**: notify when a matching unit arrives — genuinely valuable for a
  buyer watching for a specific grade/model/price combination.
- **Quote-status and order-status updates**: shipping milestones (loaded, departed, arrived at port)
  — this matters more here than almost anywhere else in e-commerce, since the buyer is waiting weeks
  for a physical unit to cross an ocean; proactive status updates are a direct anxiety-reduction and
  trust-building tool.
- **Marketing opt-in**: kept separate from transactional/order updates, same reasoning as any
  business — don't force marketing consent to get status updates on an active order.

---

## Recommended Listing Schema

**Identity**: Title, Make, Model, Year, Chassis/VIN, Body Type, Color, Steering Position (LHD/RHD)

**Pricing**: Price (USD, asking), Incoterm options available (FOB/C&F/CIF), Days in Stock

**Condition & trust**: Auction Grade, Repair/Accident History (修復歴), Mileage (km, with photographed
odometer), One-Owner flag, Auction Sheet (attached/summarized)

**Mechanical spec**: Engine, Displacement (CC), Drivetrain, Fuel Type, Transmission

**Features**: structured options/equipment list

**Media**: full photo gallery (not a single main image) — engine bay, interior, exterior all angles,
undercarriage where relevant, odometer photo

**Category**: Vehicle vs. Heavy Equipment (top-level), sub-category within each

**Meta**: URL/slug, Listed Date, Last Updated

No "Dealer Name/City/State/Zip/Rating/Phone" fields — there's one seller, and its details belong in
site-wide footer/contact info, not repeated per listing.
