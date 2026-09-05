# M.A.S & SONS Backend — Notification Subsystem

**Status**: design doc. Location once built: `app/Services/Notifications/` (excluding `Email/`,
covered separately), models: `app/Models/notification.py`,
`app/Models/notification_preference.py`.
**Builds on**: `sharedinfrastructure.md` (`Core.Cache.idempotency`, `Core.results.OperationResult`, `Core.guest_contact.GuestContact`, `Core.jobs`).

## 1. Dispatch flow

```
Domain event (e.g. QuoteRequestService.created)
  → RecipientResolver (who gets it — buyer, staff, or both)
  → NotificationService.send() / send_to_many()
       → is_known_type() check against the types.py registry
       → NotificationDispatcher.dispatch()
            → get_type_definition()  (category/priority/email_template/applicable_recipient)
            → PreferenceResolver.resolve_channels()  → set of enabled channels
            → for each enabled channel: Channel.deliver(payload, db)
                 - DatabaseChannel ("in_app"): persist Notification row + push real-time event
                 - EmailChannel ("email"): delegate to EmailService.send_template(...)
```

Every `Channel.deliver()` returns an `OperationResult` (`sharedinfrastructure.md` §2) and never
raises — failures are caught, logged, and returned as a typed failure. One channel failing (e.g. a
real-time push, if the buyer isn't connected) never blocks the other (e.g. the email still sends).
This is the core reliability property of the whole subsystem: a downstream failure degrades one
delivery path, never the whole notification.

## 2. Recipient resolution — a single-company system, kept deliberately simple

There is one company, so recipient resolution here is one of exactly two shapes:

- **The buyer** — the user (or guest contact — email/WhatsApp) who submitted the quote request,
  sourcing request, or is watching a saved search.
- **Staff** — every active internal user with the relevant permission. There's no "which
  company's staff" question to answer, because all staff belong to the one company.

```python
class RecipientResolver:
    @staticmethod
    def buyer_contact(quote_request: QuoteRequest) -> GuestContact:
        # Guest-allowed: a quote request doesn't require an account. Returns the shared
        # GuestContact shape (sharedinfrastructure.md §5) regardless of whether this
        # request came from a QuoteRequest, SourcingRequest, or BuybackLead.
        ...

    @staticmethod
    def staff(permission_name: str, db: Session) -> list[User]:
        # Every active staff user with this permission.
        ...
```

**Guest recipients are a first-class case, not an edge case.** A large share of this system's
notification volume goes to someone with no `User` row at all — a guest quote request, a Japanese
buyback lead. `RecipientResolver` and `NotificationDispatcher` both accept a `GuestContact` as a
valid recipient, not only a `user_id` — the same shape every guest-facing model already embeds
(`sharedinfrastructure.md` §5), so there's one definition of "a recipient with no account," not
three slightly different ones per request type.

## 3. Type registry (`types.py`) — code, not database

A static dict is the single source of truth per notification type. A new type is a reviewed code
change, not a runtime data change — the right trade-off for a domain where types change rarely and
correctness matters more than runtime configurability.

```python
NOTIFICATION_TYPES: dict[str, dict] = {
    "quote_request.received": {
        "category": "quote_request", "priority": "high",
        "applicable_recipient": "staff", "default_channels": {"in_app", "email"},
        "email_template": "quote_requests/staff_alert", "retention_days": 90,
    },
    "quote_request.quoted": {
        "category": "quote_request", "priority": "high",
        "applicable_recipient": "buyer", "default_channels": {"email"},   # buyer has no in-app inbox unless logged in
        "email_template": "quote_requests/quote_ready", "retention_days": 365,
    },
    "sourcing_request.received": { "applicable_recipient": "staff", ... },
    "sourcing_request.sourced":  { "applicable_recipient": "buyer", ... },
    "buyback_lead.received":     { "applicable_recipient": "staff", ... },
    "saved_search.new_match":    { "applicable_recipient": "buyer", "default_channels": {"email", "in_app"}, ... },
    "stock.shipment_update":     {
        "category": "order", "priority": "high",
        "applicable_recipient": "buyer", "default_channels": {"email", "in_app"},
        "email_template": "orders/shipment_update", "retention_days": 365,
    },
}
```

`applicable_recipient` is deliberately just "buyer" or "staff" — there's no per-company-role matrix
to encode.

## 4. Preference resolution

A registered buyer can control channel preferences (`is_email_paused`, quiet hours, digest
frequency) via `NotificationPreference`, stored as a per-type JSONB matrix so new types don't need a
schema migration to gain their own preference row.

- **Guest buyers have no preference row and no opt-out UI.** They receive exactly the transactional
  messages their own action triggered (quote confirmation, status update) and nothing else — there
  is no marketing/digest channel to suppress for someone who never created an account. Preference
  resolution only applies once a `User` row exists.
- **Critical-priority notifications** (a shipment update on a request the buyer is actively waiting
  on) bypass quiet hours but never bypass an explicit unsubscribe or `is_email_paused` — a shipment
  ETA is not urgent enough to override someone's own opt-out.
- **`marketing_opt_in` is a separate flag, not a channel in `channel_preferences`.** The Feature
  Audit's Notifications module calls out marketing/promotional messaging as needing its own opt-in,
  kept apart from transactional and order-status updates — a buyer who opts out of marketing still
  gets their shipment updates, and disabling a transactional channel never silently disables
  marketing too. `NotificationPreference.marketing_opt_in` defaults to `FALSE`; nothing in
  `NOTIFICATION_TYPES` today is categorized as marketing, so this is provisioned ahead of the first
  campaign feature rather than wired to a live send path yet.

## 5. Idempotency and deduplication

Every dispatch call carries an explicit idempotency key
(`f"{notification_type}:{source_entity_type}:{source_entity_id}"`), checked via the shared
`Core.Cache.idempotency.check_and_mark` (`sharedinfrastructure.md` §1) with a TTL matching the
operation's realistic retry window (a few minutes) — not a bespoke Redis call built for this
subsystem alone. Check-and-mark is atomic by construction — there is no read-then-write gap for two
concurrent triggers to race through.

This matters most exactly where the cost of getting it wrong is highest: a quote request or buyback
lead saved to the database is the one event this system cannot afford to silently duplicate or
drop. A buyer who receives the confirmation email twice is mildly annoying; a buyer whose
notification silently never fires because of a dedup race is a lost sale. The atomic Redis check
exists specifically to close that gap.

## 6. Data model

### `Notification`

Fan-out-on-write: one row per recipient per notification. This keeps an inbox query a single
indexed scan at read time rather than a fan-out computed on every page load.

This is the second of the two tables in this system that reach millions of rows over time (the
other is `email_logs` — `emailsubsystem.md` §5) for the identical reason: every quote request,
sourcing request and buyback lead generates one. Partitioned by month from the start, using the
same `Core.jobs.partitioning` utility and rotation endpoint as `email_logs`
(`sharedinfrastructure.md` §4/§6) — one partitioning implementation serves both tables.

```sql
CREATE TABLE notifications (
    id                BIGSERIAL PRIMARY KEY,
    recipient_type    TEXT NOT NULL CHECK (recipient_type IN ('user', 'staff')),
    recipient_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    category          TEXT NOT NULL,
    priority          TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    title             TEXT NOT NULL,
    body              TEXT NOT NULL,
    action_url        TEXT,
    source_entity_type TEXT,        -- 'quote_request' | 'sourcing_request' | 'buyback_lead' | 'unit' | 'order'
    source_entity_id  BIGINT,       -- no FK — polymorphic by design, same as tags/feedback-style references
    status            TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
    read_at           TIMESTAMPTZ,
    expires_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_notifications_recipient_status ON notifications (recipient_id, status, created_at DESC);
CREATE INDEX idx_notifications_expires ON notifications (expires_at) WHERE expires_at IS NOT NULL;
```

Note: `recipient_id` FK + partitioning together mean the FK is declared per-partition (PostgreSQL
requires the partition key or a compatible constraint on partitioned foreign keys) — a detail for
the actual migration, not a change to the design above.

**No soft-delete column, intentionally.** A notification is an event projection, not an
authoritative record — the authoritative record is the `quote_request` / `buyback_lead` row it
points to. The notification itself is disposable and hard-deleted by retention.

### `NotificationPreference`

One row per registered user. Guest buyers never get one (see §4).

```sql
CREATE TABLE notification_preferences (
    id                    BIGSERIAL PRIMARY KEY,
    user_id               BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    channel_preferences   JSONB NOT NULL DEFAULT '{}',
    is_email_paused       BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_opt_in      BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start     TIME,
    quiet_hours_end       TIME,
    timezone              TEXT NOT NULL DEFAULT 'UTC',
    digest_frequency      TEXT NOT NULL DEFAULT 'realtime'
                              CHECK (digest_frequency IN ('realtime', 'daily', 'weekly', 'never')),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at            TIMESTAMPTZ,      -- soft delete, matching every other authoritative table (databaseschema.md conventions)
    deleted_by            BIGINT REFERENCES users(id)
);
```

Unlike `notifications`/`email_logs`, this table is a settings record (one row per user), not an
event projection, so it follows the standard full-audit-trail column set rather than the
retention-only exception those two tables use.

### Retention — triggered by infrastructure, not an in-process timer

```
Cloud Scheduler (daily, 03:00 JST)
  → POST /internal/jobs/purge-expired-notifications   (guarded by Core.jobs.auth.verify_service_token,
                                                         sharedinfrastructure.md §4 — not exposed publicly)
    → NotificationCleanupService.purge_expired(db)
```

For terminal (read/archived) rows within a still-current partition, batched deletes (`LIMIT 5000`
per transaction) avoid a long-held lock. For rows old enough to fall in a fully-expired partition,
the monthly `rotate-partitions` job (§6 above, shared with `email_logs`) simply drops that partition
— no row-by-row delete needed at all once retention has passed a full partition boundary. Triggering
both jobs from Cloud Scheduler rather than an in-process `asyncio` loop is a deliberate reliability
choice: a Cloud Run instance can scale to zero between requests, so anything relying on a long-lived
in-process timer to eventually fire simply won't, silently. Retention here depends on infrastructure
that doesn't depend on any single app instance staying alive.

## 7. Rate limiting

No per-recipient throttle on in-app notifications (low cost, low risk). Email fan-out reuses the
same `Core.Cache.rate_limiter` call the email subsystem itself uses (`sharedinfrastructure.md` §1,
`emailsubsystem.md` §6) — deliberately the same limiter, not a second one, so a burst of
notification-triggered emails and a burst of directly-sent emails count against the same budget for
a given address.
