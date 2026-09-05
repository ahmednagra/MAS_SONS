# ADR 0002 — Export confirmed, settlement, attribution, and catalogue depth

**Date:** 2026-09-04
**Status:** Accepted
**Supersedes:** Revision 2 of `MAS_SONS_MASTER_DESIGN_BRIEF.md`,
`MAS_SONS_PROJECT_ARCHITECTURE.md`, `MAS_SONS_IMPLEMENTATION_PLAN.md` where they
conflict. Does not supersede ADR 0001; it extends it.
**Location in repo:** `docs/decisions/0002-commerce-capabilities.md`

---

## Evidence base

`FACT` — The supplied business card was read directly for this decision, rather than
transcribed second-hand. It confirms: 古物商許可番号 第401210001551 · 買取 as the red
headline with 販売 second · a LINE QR code · 相談無料 · 24時間受付 · the handwritten
`______ 万円` offer line · the machinery list · the Shimotsuma address · a Land
Cruiser Prado as the sole passenger-vehicle image.

`FACT` — **The card is entirely in Japanese and contains no reference to export**,
no English, no destination countries, and no shipping capability. It is a
domestic-facing artifact.

`FACT` — **Export is an active part of the business today.** Stated by the client on
2026-09-04. This resolves the `ASSUMPTION` recorded in ADR 0001 and triggers that
ADR's review clause. The card is not evidence for it; the client statement is. Label
it accordingly and do not retro-fit the artifact to match.

`FACT` — Client decisions of 2026-09-04: settlement is a ledger **with** full online
payment; referral is tracked **and** carries payable commission.

`OBSERVATION` — The card prints 「タイヤシャワー」. No such machine exists; this is
almost certainly 「タイヤショベル」 (wheel loader), which is how the corpus already
reads it. 「クレーン車」 appears twice in the machinery list. Both are recorded as
open items, not silently corrected — this is licence-adjacent artwork.

`OBSERVATION` — The registered address is ローズナミキ1号棟102号室, an apartment
room. That is a plausible registered 営業所 but is not evidently a visitable yard or
showroom.

`OBSERVATION` — The machinery vocabulary on the card is trade slang: ユンボ,
タイヤショベル, ダンプ. Buyers search in this register; catalogue records will not
be written in it. See Decision 8.

`OPEN QUESTION` — LINE Official Account ID (the card carries only a QR image) ·
whether a yard or showroom exists at, or separate from, the registered address ·
destination countries · forwarder vs in-house logistics · payment gateway ·
紹介料 policy and its tax treatment · JUMVEA membership · the confirmed 特商法
display set · 返品特約 policy. Each is recorded in Implementation Plan Phase 0 with
an extension point designed in its place.

---

## Decision 1 — Export is a confirmed capability

ADR 0001 recorded export as an `ASSUMPTION`, and Master Design Brief §14 gated
`EXPORT / DELIVERY` navigation behind "confirmed export operations".

**Decided:** export is confirmed. The capability gate is removed, §76 no longer
hedges "Request Export Quote", and Implementation Plan Phase 10 becomes an active
specification rather than a conditional one.

**Consequence:** Incoterms, pre-shipment inspection, telegraphic-transfer banking
and the export buying-process guide are all specified. Destination countries remain
an open question — a confirmed *capability* is not a confirmed *destination list*,
and Brief §86 still forbids publishing countries the business cannot service.

---

## Decision 2 — Price terms are Incoterms 2020 codes, and the code is CFR

**Decided:** `delivery_term` is a reference-table key, not free text. Export terms use
Incoterms 2020 codes. Domestic terms (店頭渡し, 納車渡し, 車上渡し, 荷卸し込み) are
separate entries in the same table; they are not Incoterms and must not be labelled
as such.

**Two constraints the model must enforce, not merely document:**

1. **The term is `CFR`, never the ampersand form or `C+F`.** That older form was
   retired from the ICC rules; `CNF` survives only because early SWIFT systems could
   not carry an ampersand. Reference exporters still print the old form — copying
   that convention would embed a dead code in a reference table that becomes
   expensive to change once records point at it.
2. **`CFR` and `CIF` apply to sea and inland-waterway carriage only.** They cannot be
   selected for a machine sold ex-yard or moved by road. `delivery_term` is
   constrained by carriage mode, or the model will permit quotes that mean nothing.

**Also:** the Incoterms rules are ICC copyright. Reference the codes; write any
customer-facing explanation in our own words.

---

## Decision 3 — Payments is a first-class domain

Payments appeared once in the corpus, as a bullet in Architecture §82's list of ADRs
someone should eventually write. Meanwhile Architecture §9 already carried a
`RESERVED` lifecycle state and Brief §24 already hedged the Reserve action on "where
the reservation workflow exists". The gap blocked reservations, deposits and any
paid product.

**Decided:** `Payments` becomes a domain (Architecture §5) with its own API boundary
and a settlement model attached to `Deal`: `Invoice`, `Payment`, `SettlementMethod`,
reconciliation and refunds.

**The ledger is method-agnostic and is the core.** 銀行振込, telegraphic transfer,
card, and JUMVEA Safe Trade are *methods* recorded against it. This matters because
the trade settles overwhelmingly by transfer: a design in which card processing is
load-bearing would be built around the exception.

**Card acceptance is in scope by client decision**, with the risk recorded rather
than argued: card fees on vehicle-value transactions are material, and cross-border
card chargebacks on high-value goods are a real exposure. Consequences that are
therefore non-negotiable — card data never touches our systems (hosted fields or
hosted checkout only, no PAN at rest, none in logs); 3-D Secure is mandatory on
cross-border capture; every write is idempotent under retry.

**Publishing payment methods triggers 特定商取引法 display obligations.** Brief §2b
was already a launch blocker; this decision makes it a blocker on the payments work
specifically.

---

## Decision 4 — Referral is a partner relationship with accrued commission

The reference exporter runs an overseas-buyer affiliate scheme attached to a paid
data product. That is not this business. For a regional 買取 operation the referrals
that matter come from 整備工場, 板金業者, 解体業者 and contractors introducing
sellers.

**Decided:** referral is modelled as a `Partner` with a referral code, commission
rate, accrual against a completed deal, and payout reporting. The referral code is
captured on **both** seller intake and buyer enquiry.

**Gated:** accrual may be specified and built; **payout logic ships only once a
紹介料 policy and its tax treatment are answered by the business.** Recorded as an
open question in Phase 0. Never invent the rate.

---

## Decision 5 — Attribution is first-touch immutable plus last-touch mutable

Brief §6b captures an origin `channel` on unit records. Nothing captured campaign
granularity, and buyer enquiries carried no attribution at all — so the business
would have known where its stock came from but not where its customers did.

**Decided:** two separate field sets on the record — a first-touch set written once
and never overwritten, and a last-touch set overwritten each session. Both carry
source, medium, campaign, referrer, landing page, and click identifiers including
`gclid`. Capture is **server-side**.

**Rationale specific to this business:** conversion happens on a LINE thread, a phone
call or a yard visit, days or weeks after the click. There is no online checkout to
attribute against. Retaining the click identifier is what makes offline conversion
import — and therefore any measurement of advertising at all — possible.

**Consequence:** attribution fields joined to a `Party` are personal data. They need
a retention policy, which connects to the lawful-basis question ADR 0001 already
raised for permanently retained `DECLINED` records.

---

## Decision 6 — The LINE enquiry deep link ships at M5, not M9

ADR 0001 deferred LINE integration to M9 while recording the channel from day one.
That was right for the Messaging API. It was applied too broadly.

**Decided:** the enquiry deep link is a URL, not an integration, and ships with the
public catalogue at M5:

```text
https://line.me/R/oaMessage/{percent-encoded @id}/?{percent-encoded text}
```

The pre-filled text carries the stock reference and an opaque token so the resulting
conversation can be attributed back to the listing (Decision 5). The scheme resolves
only on LINE for iOS and Android, so desktop requires a fallback — QR plus a
selectable account ID. The Messaging API integration remains at M9.

**Why this matters:** the card promises 24時間受付 and carries a LINE QR. Between M5
and M9 the public catalogue would otherwise have had no messaging path at all.

---

## Decision 7 — Sorting is category-resolved, URL-bound and deterministic

**Decided:** sort orders resolve from the active category, exactly as facets do under
ADR 0001 Decision 2. Mileage ordering is meaningless on an excavator; operating-hours
ordering is meaningless on a passenger car. One results page, one URL scheme, a
category-selected sort set.

Three requirements that are defects if omitted:

- the active sort is represented in the URL, per Brief §21
- every sort has a **deterministic tiebreaker**, or pagination duplicates and drops
  records across pages
- **NULL placement is explicit** — an item with no recorded operating hours must not
  surface at the top of "hours, low to high"

---

## Decision 8 — Reference keys carry an alias set

ADR 0001 Decision 3 established that structured values live in reference tables with
`label_ja` and `label_en`, and records store only the key.

**Decided:** each key additionally carries an alias set used for search matching.

**Rationale:** the company's own card advertises ユンボ and タイヤショベル. A
catalogue record will store `hydraulic_excavator` and render 油圧ショベル. Without
aliases, a domestic buyer searching the word the business itself prints returns zero
results. The cost at M1 is one column; retrofitting means re-indexing every record.

---

## Also decided

- **Equipment attributes are extended** to what the category leaders actually facet
  on: weight *class bands* alongside `operating_weight`, auxiliary hydraulic piping
  (配管付 / 併用配管付), arm and boom configuration, undercarriage type and shoe
  width, crane specification, and 排出ガス規制対応. The last is absent even from the
  leading Japanese equipment marketplace and gates which machines may work on
  Japanese public-works sites — it is both load-bearing and a differentiator.
- **`purchasable_area`** — domestic / overseas eligibility — becomes a facet on the
  record rather than a note in prose.
- **Pre-shipment inspection is a document artefact**, not a parenthesis. JEVIC, QISJ
  and EAA inspections include a radiation test, and the company operates in Ibaraki;
  this is not a generic export checkbox for this seller.
- **Brief §45 becomes conditional.** It assumed showroom, inventory-yard and
  equipment-yard photography. Whether such a site exists is now an open question, and
  the 出張査定 booking capability added at M2 carries more weight if it does not.

---

## Explicitly rejected

Recorded so they are not revisited without new evidence:

- **一括査定 aggregation** — the business is a single buyer, not an aggregator.
- **Seller ratings and multi-vendor marketplace mechanics** — single-party seller.
- **Loyalty-point sorting** — no such programme exists.
- **Geographic east-west sorting** — a reference exporter feature that assumes
  nationwide yards; this business has one site.
- **Live auction access and real-time bidding** — ADR 0001 defers auction sourcing
  to M16, and Brief §41 forbids implying auction access without verified capability.
- **Social login** — an identity-provider dependency for little gain before the M14
  account milestone.

---

## Retained from ADR 0001 without change

Decisions 1–5 of ADR 0001 stand: the lifecycle beginning at first seller contact,
permanent retention of `DECLINED` records, one `InventoryItem` for vehicles and
equipment, the three-class i18n model, acquisition-first build order, and a design
system built from screens rather than ahead of them. Nothing here revisits them.

The data truth principle (Brief §86), the AI truth policy (Architecture §49), the
monolith-first principle (§60) and the stop conditions (Plan §30) likewise stand.

---

## Review trigger

Revisit when the LINE Official Account ID is supplied, when destination countries are
confirmed, when the 紹介料 policy and its tax treatment are answered, when a payment
gateway is selected, or when the yard/showroom question is resolved.
