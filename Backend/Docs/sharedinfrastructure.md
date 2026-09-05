# M.A.S & SONS Backend — Shared Infrastructure

**Status**: design doc. Location once built: `app/Core/`.

Every subsystem doc in this folder (`emailsubsystem.md`, `notificationssubsystem.md`,
`websocketsubsystem.md`) needs the same handful of cross-cutting primitives: an atomic
check-and-mark for idempotency, a rate limiter, a "never raise, return a typed outcome" result
shape, a retry-with-backoff helper, a way to authenticate scheduled-job calls, and a shared shape
for a recipient who has no account. Building each of those once, here, and having every subsystem
import it is the difference between one correct implementation and three slightly-different ones
that drift apart the first time one of them gets a bug fix the others don't.

## 1. `app/Core/Cache/` — the one Redis-backed layer everything else builds on

```python
# redis_client.py — a single connection pool, imported everywhere Redis is needed.
# No subsystem opens its own connection.
redis_client: Redis = ...

# idempotency.py
def check_and_mark(key: str, ttl_seconds: int) -> bool:
    """Atomic SET NX EX. Returns True if this call is the first to see `key` within the
    TTL window (proceed), False if another call already claimed it (skip). Used for:
    notification dispatch idempotency, and real-time broadcast dedup — see below."""

# rate_limiter.py
def check_and_increment(key: str, window_seconds: int, limit: int) -> bool:
    """Sliding-window counter via INCR + EXPIRE. Returns True if under limit (proceed),
    False if the caller should be throttled. Used for: per-recipient email send caps,
    and the same mechanism is the natural home for a future per-IP rate limit on the
    public quote-request/buyback-lead forms, without inventing a second limiter."""
```

**What this replaces**: without this module, the email subsystem's rate limiter, the notification
dispatcher's idempotency check, and the real-time layer's broadcast-dedup cache would each end up
as separate ad hoc pieces of Redis-key-naming and TTL logic, written at different times by whoever
built that subsystem first. One module, one key-naming convention
(`{subsystem}:{purpose}:{identifier}`), one place to change the Redis client configuration (TLS,
connection pool size, failover behavior) when it needs to change.

**Real-time dedup uses this too, not a separate in-memory cache.** An in-memory
per-instance dedup cache doesn't actually work correctly the moment the app runs on more than one
Cloud Run instance — two instances each think they're the first to see an event. Using the same
Redis-backed `check_and_mark` for broadcast dedup as for notification-send idempotency both removes
a class of subtle multi-instance bug and means there's only one idempotency mechanism to reason
about, not two with different correctness properties.

## 2. `app/Core/results.py` — one "never raise" shape, not three

Every subsystem doc states some version of "this must never raise — failures are caught and
returned as a typed result." That's the same contract every time; it should be the same type every
time:

```python
@dataclass
class OperationResult:
    success: bool
    error_code: str | None = None
    error_message: str | None = None
    attempts: int = 1
    extra: dict = field(default_factory=dict)
```

`EmailSendResult`, a notification channel's delivery result, and a real-time publish outcome are all
`OperationResult` — with `extra` carrying whatever's specific to that call site (a provider message
ID, a channel name), rather than each subsystem defining its own bespoke success/failure dataclass
that happens to carry the same three fields under different names.

## 3. `app/Core/retry.py` — one backoff implementation

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

## 4. `app/Core/jobs/` — one pattern for every scheduled job

Both `email_logs` and `notifications` need monthly partition rotation, and `notifications` needs a
retention purge. Rather than three bespoke `/internal/jobs/*` endpoints each reinventing
service-to-service auth:

```python
# auth.py — one dependency, used by every internal job endpoint.
def verify_service_token(request: Request) -> None:
    """Validates the Cloud Scheduler service-to-service token. Raises 401/403 — this is the
    one place in the whole system where an internal endpoint is allowed to be stricter than
    'never raise', because an unauthenticated call here should hard-fail, not degrade."""

# partitioning.py — the shared table-partitioning utility, generic over table name.
def create_next_partition(table: str, schema: str = "public") -> None: ...
def drop_expired_partitions(table: str, retention_months: int) -> None: ...
```

```
routes/api/v0/internal/jobs.py
    POST /internal/jobs/rotate-partitions        body: {"table": "email_logs" | "notifications"}
    POST /internal/jobs/purge-expired-notifications
```

Two tables, one partitioning utility, one Cloud Scheduler job definition per table pointing at the
same generic endpoint — not two copies of "create next month's partition" logic.

## 5. `app/Core/guest_contact.py` — one shape for "a recipient with no account"

A guest quote request, a guest sourcing request, and a Japanese buyback lead all need the same
thing: a way to notify someone who has no `User` row. Rather than each of those three models and
the notification `RecipientResolver` independently defining their own "email or whatsapp, maybe a
user_id" shape:

```python
@dataclass
class GuestContact:
    email: str | None
    whatsapp: str | None
    user_id: int | None = None   # set once/if this contact later creates an account

    def is_guest(self) -> bool:
        return self.user_id is None
```

`QuoteRequest`, `SourcingRequest`, and `BuybackLead` each embed a `GuestContact` (as columns, via
a shared Pydantic/SQLAlchemy mixin) instead of three separately-defined but identical
`email` / `whatsapp` / `user_id` column trios. `RecipientResolver.buyer_contact()` (see
`notificationssubsystem.md` §2) returns this same type regardless of which of the three request
kinds it was called for — one recipient shape, three producers.

## 6. Table partitioning — now consistent across both log-shaped tables

`emailsubsystem.md` partitions `email_logs` by month. `notifications` grows for the identical
reason (one row per recipient per event, indefinitely) and is now partitioned the same way, using
the same `create_next_partition`/`drop_expired_partitions` utility from §4 rather than a
second, differently-implemented partition scheme:

```sql
CREATE TABLE notifications (
    ...
) PARTITION BY RANGE (created_at);
```

Both tables' monthly rotation is triggered by the same `POST /internal/jobs/rotate-partitions`
endpoint, parameterized by table name — one job definition in Cloud Scheduler per table, both
calling the same code path.

## 7. What every subsystem doc should now say, instead of repeating itself

- `emailsubsystem.md` — the dispatcher's retry loop is `Core.retry.retry_with_backoff`; the
  per-recipient send cap is `Core.Cache.rate_limiter`; `EmailSendResult` is an `OperationResult`;
  `email_logs` partition rotation is `Core.jobs.partitioning`.
- `notificationssubsystem.md` — dispatch idempotency is `Core.Cache.idempotency`; a channel's
  delivery outcome is an `OperationResult`; guest recipients are `Core.GuestContact`; `notifications`
  partition rotation and the retention purge both go through `Core.jobs`.
- `websocketsubsystem.md` — broadcast dedup is `Core.Cache.idempotency` (the same Redis-backed
  check used for notification idempotency, not a separate in-memory cache); a publish outcome is an
  `OperationResult`.

None of those three files needs to re-explain *how* a check-and-mark or a backoff loop works — they
reference this doc and state which key/table/call site they're using it for. If a future subsystem
needs "never raise," "don't process the same event twice," or "run on a schedule without depending
on a process staying alive," it reaches for what's already here before writing a fourth version of
any of them.
