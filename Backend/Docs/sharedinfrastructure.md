# M.A.S & SONS Backend — Shared Infrastructure

**Status**: design doc. Location once built: `app/Utils/` (cross-cutting primitives) and
`app/Core/Storage/` (pluggable provider abstractions) — the same split `echooo-backend` already
uses, not an independently-invented `app/Core/` namespace for everything.

Every subsystem doc in this folder (`emailsubsystem.md`, `notificationssubsystem.md`,
`websocketsubsystem.md`, `databaseschema.md`) needs the same handful of cross-cutting primitives:
an atomic check-and-mark for idempotency, a rate limiter, a "never raise, return a typed outcome"
result shape (for the specific call sites that are reachable outside an HTTP request — see the note
in §2), a retry-with-backoff helper, a way to authenticate scheduled-job calls, and a shared shape
for a recipient who has no account. Building each of those once, here, and having every subsystem
import it is the difference between one correct implementation and three slightly-different ones
that drift apart the first time one of them gets a bug fix the others don't.

## 1. `app/Utils/RateLimiter.py` / `app/Utils/Idempotency.py` — the one Redis-backed layer everything else builds on

```python
# app/Utils/RateLimiter.py — mirrors echooo-backend's app/Utils/RateLimit.py placement exactly.
def check_and_increment(key: str, window_seconds: int, limit: int) -> bool:
    """Sliding-window counter via INCR + EXPIRE. Returns True if under limit (proceed),
    False if the caller should be throttled. Used for: per-recipient email send caps,
    and the same mechanism is the natural home for a future per-IP rate limit on the
    public quote-request/buyback-lead forms, without inventing a second limiter."""

# app/Utils/Idempotency.py
def check_and_mark(key: str, ttl_seconds: int) -> bool:
    """Atomic SET NX EX. Returns True if this call is the first to see `key` within the
    TTL window (proceed), False if another call already claimed it (skip). Used for:
    notification dispatch idempotency, and real-time broadcast dedup — see below."""
```

Both use the single Redis connection pool `config/settings.py` wires up (mirroring
`echooo-backend`'s own Redis usage) — no subsystem opens its own connection. One key-naming
convention (`{subsystem}:{purpose}:{identifier}`), one place to change Redis configuration (TLS,
pool size, failover behavior) when it needs to change. A Redis outage **fails open** for rate
limiting (matches `echooo-backend`'s `RateLimit.py` precedent exactly — degrade to a per-process
fallback and log it once, never lock out real traffic because a cache dependency hiccuped) and fails
closed for idempotency only in the sense that a duplicate might get through, never that a legitimate
request gets rejected.

**Real-time dedup uses `Idempotency.py` too, not a separate in-memory cache.** An in-memory
per-instance dedup cache doesn't actually work correctly the moment the app runs on more than one
Cloud Run instance — two instances each think they're the first to see an event. Using the same
Redis-backed `check_and_mark` for broadcast dedup as for notification-send idempotency both removes
a class of subtle multi-instance bug and means there's only one idempotency mechanism to reason
about, not two with different correctness properties.

## 2. `app/Utils/Results.py` — one "never raise" shape, for the call sites that need one

```python
@dataclass
class OperationResult:
    success: bool
    error_code: str | None = None
    error_message: str | None = None
    attempts: int = 1
    extra: dict = field(default_factory=dict)
```

**This is not the universal Service-layer return type.** `codingconventions.md` §2 draws the actual
line, matching `echooo-backend`'s own observed pattern (its Services raise `HTTPException` directly
— see e.g. `BrandService.py`): a Service that's *only ever* called from inside an HTTP request
(Stock, Orders, Reviews, Auth, ...) raises `HTTPException` for a domain error, the same way
`echooo-backend`'s Services do — there is no HTTP response to attach an `OperationResult` to that a
Controller wouldn't just immediately convert into the exact same `HTTPException` anyway, so
returning one first is an extra step with no reader.

`OperationResult` earns its keep specifically where a call site has **no HTTP context to raise
into** — an `EmailDispatcher` retrying a provider in a `BackgroundTasks` job, a notification
channel's delivery attempt, a WebSocket `publish()` call. `raise HTTPException` there has nothing to
attach to; a typed result the caller can log and move on from is the only sane contract. `EmailSendResult`,
a notification channel's delivery result, and a real-time publish outcome are all `OperationResult`
— with `extra` carrying whatever's specific to that call site (a provider message ID, a channel
name), rather than each subsystem defining its own bespoke success/failure dataclass that happens to
carry the same three fields under different names.

## 3. `app/Utils/Retry.py` — one backoff implementation

```python
def retry_with_backoff(
    fn: Callable[[], T],
    classify: Callable[[Exception], Literal["permanent", "transient"]],
    max_attempts: int = 4,
    base_delay_seconds: float = 2.0,
) -> OperationResult:
    """Linear backoff (base_delay × attempt_number). A 'permanent' classification stops
    immediately; 'transient' retries up to max_attempts. Returns OperationResult — never raises."""
```

The email dispatcher's primary/backup provider retry loop is the first, but not the only, consumer
— any future outbound call that can fail transiently (a shipping-carrier API, an SMS provider) uses
this same helper instead of hand-rolling another backoff loop with slightly different edge-case
behavior.

## 4. `app/Utils/service_auth.py` / `app/Utils/partitioning.py` — one pattern for every scheduled/internal job

Both `email_logs` and `notifications` need monthly partition rotation, and `notifications` needs a
retention purge; both go through internal endpoints that must never be reachable from a browser.
Rather than bespoke `/internal/jobs/*` endpoints each reinventing service-to-service auth:

```python
# app/Utils/service_auth.py — mirrors echooo-backend's own file of the same name and purpose exactly:
# a bearer service token checked against settings, guarding endpoints called by trusted
# first-party callers (there, echooo-ai-service; here, Cloud Scheduler) — never end users.
def verify_service_token(request: Request) -> None:
    """Validates the Cloud Scheduler service-to-service token. Raises 401/403 — this is the
    one place in the whole system where an internal endpoint is allowed to be stricter than
    'never raise', because an unauthenticated call here should hard-fail, not degrade."""

# app/Utils/partitioning.py — the shared table-partitioning utility, generic over table name.
def create_next_partition(table: str, schema: str = "public") -> None: ...
def drop_expired_partitions(table: str, retention_months: int) -> None: ...
```

```
routes/api/v0/internal/jobs.py
    POST /internal/jobs/rotate-partitions        body: {"table": "email_logs" | "notifications" | "audit_logs" | "websocket_connection_log"}
    POST /internal/jobs/purge-expired-notifications
```

Four tables, one partitioning utility, one Cloud Scheduler job definition per table pointing at the
same generic endpoint — not four copies of "create next month's partition" logic.

## 5. `app/Utils/GuestContact.py` — one shape for "a recipient with no account"

A guest quote request and a guest sourcing request both need the same thing: a way to notify someone
who has no `User` row. Rather than each of those two models and the notification
`RecipientResolver` independently defining their own "name, email or whatsapp, maybe a user_id"
shape:

```python
@dataclass
class GuestContact:
    name: str
    email: str | None
    whatsapp: str | None
    user_id: int | None = None   # set once/if this contact later creates an account

    def is_guest(self) -> bool:
        return self.user_id is None
```

`QuoteRequest` and `SourcingRequest` each embed a `GuestContact` (as `contact_name`/`contact_email`/
`contact_whatsapp`/`user_id` columns, via a shared Pydantic/SQLAlchemy mixin) instead of two
separately-defined but identical column quartets — the Contact/Lead-gen module's own field list for
both forms names a contact name alongside email/WhatsApp, so `name` is part of the shape, not an
optional extra. `BuybackLead` deliberately does not use this shape (`databaseschema.md` §3) — that
flow is LINE/phone-first, not email-first, and models `name`/`phone` as plain columns instead.
`RecipientResolver.buyer_contact()` (see `notificationssubsystem.md` §2) returns this same type
regardless of which of the two request kinds it was called for — one recipient shape, two producers.

## 6. Table partitioning — now consistent across four log-shaped tables

`emailsubsystem.md` partitions `email_logs` by month. `notifications`, `audit_logs`, and
`websocket_connection_log` all grow for the identical reason (one row per recipient/action/
connection event, indefinitely) and are now partitioned the same way, using the same
`create_next_partition`/`drop_expired_partitions` utility from §4 rather than a second,
differently-implemented partition scheme:

```sql
CREATE TABLE notifications (
    ...
) PARTITION BY RANGE (created_at);
```

All four tables' monthly rotation is triggered by the same `POST /internal/jobs/rotate-partitions`
endpoint, parameterized by table name — one job definition in Cloud Scheduler per table, all four
calling the same code path.

## 7. What every subsystem doc should now say, instead of repeating itself

- `emailsubsystem.md` — the dispatcher's retry loop is `Utils.Retry.retry_with_backoff`; the
  per-recipient send cap is `Utils.RateLimiter`; `EmailSendResult` is an `OperationResult`
  (`Utils.Results`); `email_logs` partition rotation is `Utils.partitioning`.
- `notificationssubsystem.md` — dispatch idempotency is `Utils.Idempotency`; a channel's
  delivery outcome is an `OperationResult`; guest recipients are `Utils.GuestContact`; `notifications`
  partition rotation and the retention purge both go through `Utils.service_auth` / `Utils.partitioning`.
- `websocketsubsystem.md` — broadcast dedup is `Utils.Idempotency` (the same Redis-backed
  check used for notification idempotency, not a separate in-memory cache); a publish outcome is an
  `OperationResult`.
- `databaseschema.md` — `audit_logs` and `websocket_connection_log` partition rotation both go
  through `Utils.partitioning`, the same as `email_logs`/`notifications`.

None of those files needs to re-explain *how* a check-and-mark or a backoff loop works — they
reference this doc and state which key/table/call site they're using it for. If a future subsystem
needs "never raise," "don't process the same event twice," or "run on a schedule without depending
on a process staying alive," it reaches for what's already here before writing a fourth version of
any of them.
