# M.A.S & SONS Backend — Email Subsystem

**Status**: design doc. Location once built: `app/Services/Notifications/Email/`, schemas:
`app/Schemas/notifications/email.py`, model: `app/Models/email_log.py`.
**Builds on**: `sharedinfrastructure.md` (`Core.retry`, `Core.Cache`, `Core.results.OperationResult`, `Core.jobs`).

## 1. Why this shape

Transactional email is business-critical here — a buyer who submits a quote request, or a Japanese
seller who submits a buyback lead, and never receives confirmation will assume the site is broken
and leave. This is designed to the same reliability bar as a payment-confirmation email, even
though no payment is involved.

```
EmailService (facade)
  → EmailDispatcher   (retry/failover orchestration, never raises)
    → ProviderFactory  (selects primary/backup provider)
      → BaseEmailProvider subclass
  → TemplateRenderer   (Jinja2, invoked by EmailService before dispatch)
```

`EmailService.send_template_in_background` is the entrypoint from request handlers: it schedules
the actual send via FastAPI `BackgroundTasks` so the HTTP response to the buyer doesn't wait on an
SMTP round-trip, and it opens its own DB session inside the background task, since the
request-scoped session is already closed by the time it runs.

## 2. Provider strategy — start with one, keep the seam for two

This system's email volume at launch is low — quote confirmations, buyback confirmations, staff
alerts, occasional saved-search digests — so a single well-chosen transactional provider (pick
based on deliverability reputation and GCP-adjacency; not fixed by this doc) is enough to start.

What's worth building on day one is the **factory/registry seam**, not a second provider:

```python
class BaseEmailProvider(ABC):
    async def send(self, message: EmailMessage) -> EmailSendResult: ...
    def is_configured(self) -> bool: ...

_REGISTRY: dict[EmailProviderName, type[BaseEmailProvider]] = {
    EmailProviderName.PRIMARY: PrimaryProvider,
}
```

Adding a real backup provider later — worth doing before email becomes revenue-critical at higher
volume — is then one new class plus one registry line, not a rewrite of every call site. The
abstraction earns its keep at the *second* provider, but costs nothing to have in place before that.

## 3. Retry / failover behavior

Uses the shared `Core.retry.retry_with_backoff` (see `sharedinfrastructure.md` §3) rather than a
bespoke loop:

```
EmailDispatcher.dispatch(message):
  1. Insert an email_logs row in 'queued' state before attempting anything.
  2. retry_with_backoff(try_primary_provider, classify=email_error_classifier, max_attempts=4):
     - Permanent (bad address, auth failure, provider says "will never succeed") → stop immediately.
     - Transient (timeout, connection drop, 5xx) → linear backoff (2s/4s/6s), retried.
  3. If the primary's OperationResult is unsuccessful and a distinct backup provider is
     configured, repeat step 2 against the backup.
  4. Every outcome updates the same email_logs row.
```

`email_error_classifier` is the one piece of this that's genuinely email-specific (SMTP auth
failures vs. connection drops, provider-specific 4xx/5xx mapping) — everything else is the shared
retry helper. The dispatcher itself never raises to its caller: `EmailSendResult` *is* an
`OperationResult` (see `sharedinfrastructure.md` §2), so a calling Service checks `.success` if it
needs the outcome and never needs a try/except around a send call. That property is the single most
important reliability guarantee in this subsystem — an email provider outage must never become a
500 on a buyer's quote-request submission.

## 4. Template rendering

- Jinja2 `Environment` with `FileSystemLoader` over `app/Templates/emails/`, `select_autoescape` for
  XSS protection, and **`StrictUndefined`** — a template referencing a variable the caller forgot to
  pass fails the send loudly in tests, not silently in production with a blank field in a
  buyer-facing email.
- `render()` produces both `.html` and `.txt` from one context — every email ships a plain-text
  fallback, which also meaningfully improves inbox deliverability.
- Template selection by convention: `"quote_requests/confirmation"` maps to
  `Templates/emails/quote_requests/confirmation.{html,txt}`.
- Templates needed at launch: `quote_requests/confirmation` (buyer), `quote_requests/staff_alert`
  (admin), `sourcing_requests/confirmation`, `sourcing_requests/staff_alert`,
  `buyback_leads/confirmation` (Japanese — this is the one customer-facing template that needs a
  native speaker's review, not a machine translation, since it's a Japanese seller's first
  impression of the business), `buyback_leads/staff_alert`, `notifications/saved_search_digest`.

## 5. Data model — `EmailLog`

Table `email_logs`. One row per send attempt, mutated in place
(`queued → sending → sent/failed/retrying`).

```sql
CREATE TABLE email_logs (
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT REFERENCES users(id) ON DELETE SET NULL,   -- nullable: buyback leads have no account
    to_email      TEXT NOT NULL,
    template_name TEXT NOT NULL,
    subject       TEXT NOT NULL,
    provider      TEXT NOT NULL,
    status        TEXT NOT NULL,
    provider_message_id TEXT,
    error_code    TEXT,
    error_message TEXT,
    attempts      SMALLINT NOT NULL DEFAULT 0,
    extra         JSONB NOT NULL DEFAULT '{}',   -- dedupe/audit metadata, e.g. {"quote_request_id": ...}
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);
```

### Why partitioned from the start

This is one of two tables in this system likely to reach millions of rows (the other is
`notifications` — see `notificationssubsystem.md` §6, partitioned the same way) — every quote
request, sourcing request, buyback lead and digest generates at least one row here, indefinitely,
for as long as the business operates. Declarative range partitioning by month, created up front:

```sql
CREATE TABLE email_logs_2026_09 PARTITION OF email_logs
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
```

Rotation (creating next month's partition, dropping ones past retention) goes through the shared
`Core.jobs.partitioning` utility and the same `/internal/jobs/rotate-partitions` endpoint that
`notifications` uses (see `sharedinfrastructure.md` §4/§6) — one implementation, parameterized by
table name, not a second one written specifically for email. This is dramatically cheaper at scale
than a single unpartitioned table with a `DELETE ... WHERE created_at < ...` retention job: dropping
a partition is near-instant and doesn't bloat the table with dead tuples the way a bulk delete does,
and every query that filters by a recent date range only touches the relevant partition instead of
scanning years of history.

### Indexes (matching real query shapes, not "index everything")

```sql
CREATE INDEX idx_email_logs_to_email ON email_logs (to_email);
CREATE INDEX idx_email_logs_status   ON email_logs (status) WHERE status IN ('queued', 'retrying');
CREATE INDEX idx_email_logs_user_created ON email_logs (user_id, created_at DESC);
CREATE INDEX idx_email_logs_extra_gin ON email_logs USING gin (extra);
```

The partial index on `status` is deliberate: the only operational query that cares about status is
"what's still in flight," which is a small fraction of the table — indexing the full column would
waste space indexing millions of `sent` rows nobody queries by status again.

## 6. Idempotency and rate limiting

Both use the shared `Core.Cache` primitives (`sharedinfrastructure.md` §1) — no bespoke Redis logic
lives in this subsystem.

- **Send idempotency**: dedup for notification-triggered email is handled one layer up, in the
  notification dispatcher (see `notificationssubsystem.md` §5) via `Core.Cache.idempotency` — the
  email subsystem itself assumes it's being asked to send a real, already-deduplicated message.
- **Rate limiting**: a per-recipient send cap (e.g. no more than N emails to the same address per
  hour), enforced in `EmailDispatcher` via `Core.Cache.rate_limiter.check_and_increment`. Both
  public-facing forms (quote request, buyback lead) are unauthenticated and are the first target
  for spam/abuse — this bounds the damage a scripted form submission can do before it reaches the
  email provider's own rate limits (which would risk the provider flagging the whole sending
  account, not just the abusive traffic).

## 7. Provider failure and dependency health

`EmailService` failures are surfaced on `/health/ready`'s dependency checks in aggregate (e.g. "X%
of sends failed in the last 5 minutes") for alerting, but a provider outage never fails the
readiness check itself — email is a degradable dependency, not a hard requirement for the app to
serve traffic. A buyer can still submit a quote request and see it saved even if the confirmation
email is temporarily queued or retrying.
