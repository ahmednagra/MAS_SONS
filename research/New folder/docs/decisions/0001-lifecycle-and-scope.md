# ADR 0001 — Acquisition lifecycle, single inventory entity, and build order

**Date:** 2026-09-03
**Status:** Accepted. Amended by
[ADR 0002](0002-commerce-capabilities.md) (2026-09-04), which resolves the export
`ASSUMPTION` below and extends Decision 3 with alias sets. Decisions 1–5 stand.
**Supersedes:** Revision 1 of `MAS_SONS_MASTER_DESIGN_BRIEF.md`,
`MAS_SONS_PROJECT_ARCHITECTURE.md`, `MAS_SONS_IMPLEMENTATION_PLAN.md`
**Location in repo:** `docs/decisions/0001-lifecycle-and-scope.md`

---

## Evidence base

`FACT` — The supplied company material (business card / licence artwork) leads with
買取 in red: 年式に関係なく高価買取いたします。 販売 appears second. It carries a LINE
QR code, 相談無料, 24時間受付, and a blank `______ 万円` line for writing an offer.

`FACT` — The company holds 古物商許可番号 第401210001551 and trades excavators, wheel
loaders, bulldozers, tractors, crane trucks, trailers, and 1t–10t dump trucks
alongside passenger vehicles.

`FACT` — As of this date there is no repository, no schema, and no code.

`ASSUMPTION` — The business sells both domestically in Japan and by export, and has
staff beyond the representative director who handle customer relationships. Stated
by the client in conversation; not yet verified against operational records.

`OPEN QUESTION` — Domestic/export split, destination countries, whether logistics
are in-house or via a forwarder, staff count, who may set purchase prices, and what
tooling is in use today. See Implementation Plan Phase 0.

---

## Decision 1 — The inventory lifecycle begins at first seller contact

Architecture §9 previously defined `DRAFT → AVAILABLE → RESERVED → SOLD →
UNAVAILABLE → ARCHIVED` and instructed that no further statuses be invented.

That sequence begins after ownership. It has no state for a machine that was offered
to the company, valued, and not bought — which is the most common outcome of the
activity the business advertises first.

**Decided:** the lifecycle is extended backwards with `OFFERED`, `VALUED`,
`DECLINED`, and `PURCHASED`. A unit record is created at first contact, not at
purchase. `DECLINED` is terminal and its records are retained permanently.

**Consequence:** within roughly a year the company holds a private dataset of what
it was offered, what it paid, and what each item later sold for. No competitor can
buy this. Every future valuation-assistance capability depends on it existing, and
it can only be accumulated forward — a decision taken later starts from zero.

**Rejected alternative:** a separate `Lead` or `ValuationRequest` table feeding a
handoff into inventory at purchase. Rejected because the handoff is exactly where
the linkage between offer price, purchase price, and eventual sale price is lost.

---

## Decision 2 — Vehicles and equipment are one entity

Architecture §6 stated they should share infrastructure, while §22 and Brief §10
specified parallel `vehicle-*` and `equipment-*` component trees, separate search,
and separate `/vehicle/[slug]` and `/equipment/[slug]` routes.

**Decided:** one `InventoryItem`, one card, one gallery, one detail template, one
route family at `/stock/[slug]`. Category selects a specification schema. Category
is a facet, never a path segment.

**Rationale:** the two differ along exactly one axis — which specifications apply.
Two trees double the maintained surface to express that, and drift apart. It also
resolves the boundary problem: a crane truck and a tractor sit awkwardly on either
side of a vehicle/equipment split, and any item that moves category later becomes a
redirect.

---

## Decision 3 — Bilingual is a data-modelling decision, not a content decision

**Decided:** three classes of text. Interface strings in message catalogues.
Structured values (category, maker, status, condition grade, destination, document
name) in reference tables carrying `label_ja` and `label_en`, with records storing
only the key. Free text — condition notes, editorial — authored twice.

**Consequence:** a unit stores `maker: komatsu`, never "コマツ". Adding a listing
costs no translation work. Getting the reference tables right in the first phase
makes bilingual close to free for the platform's life; getting them wrong makes
every listing a translation task forever.

---

## Decision 4 — Build order inverts to acquisition first

Revision 1 sequenced homepage at M3 and sell/trade-in at M8.

**Decided:** core records → purchase intake and valuation → internal stock
operations → public catalogue → document packs. The homepage moves to M8.

**Rationale:** the public site is a read view over records the internal system
maintains. Built first, it is built against invented data and then rebuilt against
real data. Built after intake and stock exist, it renders real records on its first
run. The most expensive manual work in this business also sits downstream of the
offer, not upstream of the enquiry.

**Risk accepted:** nothing is publicly visible until M5. If the company needs a
public presence sooner, a static single page carrying the licence details and
contact information is the correct stopgap — not an accelerated catalogue built on
placeholder inventory.

---

## Decision 5 — The design system is built from screens, not ahead of them

Brief §10 listed ~35 components and Plan Phase 1 required them before any page.
Ten states each is roughly 350 speculative permutations.

**Decided:** tokens are built fully in Phase 1. Components are built inside the
screen that first needs them and promoted to the system on second use.

---

## Also changed

- **Palette.** Warm Ivory `#F7F6F2` with Deep Vermilion `#B43A2F` replaced. Cream
  with a warm-red accent is the current default output of AI design tooling and
  reads as templated, which Brief §7 prohibits; it also contradicted §8's ban on
  decorative red. Replaced with ink/steel neutrals and colour reserved for state.
- **Legal display.** Brief §2b added covering 古物商法 and 特商法 display obligations.
  Absent from Revision 1. `OPEN QUESTION` — the exact required set must be
  confirmed by someone qualified in Japan. Treated as a launch blocker.
- **Inbound channels.** Brief §6b added. LINE is on the business card and is likely
  the primary seller channel. The channel field is recorded from day one;
  integration is deliberately deferred.
- **Greenfield.** Phase 0 changed from repository audit to decisions and scaffold.

---

## Retained from Revision 1 without change

The data truth principle (Brief §86), the AI truth policy (Architecture §49), the
monolith-first principle (§60), the anti-patterns list (Plan §31), the stop
conditions (Plan §30), and the final rule — optimise for reliable business
capability per unit of complexity, not for code written. These are correct and
should not be revisited.

---

## Review trigger

Revisit this ADR when any of the Phase 0 open questions is answered, when export
destination requirements are confirmed with the company, or when a second operator
begins using the system daily.
