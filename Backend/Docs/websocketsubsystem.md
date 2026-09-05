# M.A.S & SONS Backend — Real-Time (WebSocket) System

**Status**: design doc. Location once built: `app/WebSocket/`, route: `routes/api/v0/websocket.py`.
**Builds on**: `sharedinfrastructure.md` (`Core.Cache.idempotency`, `Core.results.OperationResult`, `Core.jobs`).

## 0. Does this system need WebSocket on day one? Answer honestly before building it.

The only two plausible real-time use cases in this domain are:

1. **Staff dashboard**: a new quote request, sourcing request, or buyback lead should appear
   without a manual refresh.
2. **A buyer tracking their own request** on a status page.

Neither is latency-sensitive in the way a chat message or live auction bid would be. **Server-Sent
Events (SSE) or a 30–60s polling interval with a short server-side cache would fully satisfy both
use cases** with a fraction of the operational complexity below — no connection-limit tuning, no
Redis-backed fan-out, no reconnect/backoff logic on the client. Unless there's another concrete
reason to stand up WebSocket infrastructure, start with polling/SSE for staff alerts and revisit
WebSocket only if a genuine sub-second-latency requirement appears later. This section documents
the full design anyway, because Redis is being provisioned from day one regardless (see
`directorystructure.md`) and having the design ready costs little — but "designed" is not the same
as "should ship at launch."

## 1. Architecture (if/when this ships)

### Connection lifecycle

- **Route**: `@router.websocket("/realtime")` under `/ws`. No `get_db` dependency on the route
  itself — a dependency injected into a WebSocket handler isn't torn down until the socket closes,
  which would hold a pooled DB connection for the connection's entire lifetime. At this system's
  connection-pool sizing (see `directorystructure.md`), even a handful of long-lived sockets each
  pinning a connection would meaningfully eat into the pool headroom other requests need.
- **Token resolution**: `Sec-WebSocket-Protocol` subprotocol carrying the JWT (keeps it out of
  URL/access logs), with a query-param fallback for clients that can't set it, and an httpOnly-cookie
  fallback for same-site browser connections.
- **Accept & register**: validate per-user connection limits, accept, auto-subscribe to `user:{id}`
  (and `staff:global` if the connection belongs to a staff account).
- **DB session discipline**: a short-lived session for connect-time auth, closed before entering the
  message loop; each per-message permission check opens its own short session.
- **Idle timeout**: a receive timeout (e.g. 60s) reaps connections that stop responding to pings.
- **Message size cap**: reject frames over a fixed limit (e.g. 100KB) — this is a public-facing
  socket; treat frame size as an untrusted-input boundary like any other.

### Channels — sized to what this business actually has happening in real time

```
user:{id}      — a buyer's own request-status updates. Auto-subscribed on connect if authenticated.
staff:global   — every staff connection. New quote/sourcing/buyback-lead alerts broadcast here.
```

No company/tenant scope (one company), no campaign/room scope (nothing in this domain maps to
either). Channel permission checks are correspondingly simple: a connection may subscribe to its
own `user:{id}`, and to `staff:global` only if the connected account has staff permission.

## 2. Event system

```python
class EventType(str, Enum):
    QUOTE_REQUEST_RECEIVED = "quote_request.received"              # → staff:global
    QUOTE_REQUEST_STATUS_CHANGED = "quote_request.status_changed"   # → user:{buyer_id}
    SOURCING_REQUEST_RECEIVED = "sourcing_request.received"         # → staff:global
    BUYBACK_LEAD_RECEIVED = "buyback_lead.received"                 # → staff:global
```

Four event types at launch, sized to what this business actually has happening in real time.
Adding a fifth later is a one-line enum addition plus a handler method — low-friction extensibility
that doesn't require having many types from day one to justify the pattern.

## 3. Redis-backed fan-out — why it's provisioned even at a single instance

The in-process connection registry holding live sockets is, by construction, local to one running
instance. The moment the app runs on more than one instance at once — which zero-downtime deploys
and basic redundancy both require regardless of real-time features — an event raised on one
instance never reaches a buyer's socket connected to a different instance without a shared fan-out
layer. Redis pub/sub is not optional infrastructure for a real-time nice-to-have; it's required the
moment horizontal scaling for availability is required, which this system commits to either way.

Mechanism: deliver to local subscribers first, then `PUBLISH` a JSON envelope to a shared Redis
channel; every instance `SUBSCRIBE`s and delivers to its own local connections, tagging each
message with an origin-instance ID so the publishing instance doesn't re-deliver to itself.

**Enablement degrades gracefully**: if Redis is unreachable, log a warning and fall back to
local-only delivery rather than failing app startup. A real-time feature degrading to "only visible
to whichever instance you happened to connect to" is an acceptable degradation; the app refusing to
boot because a cache dependency is temporarily down is not. `publish()` returns an `OperationResult`
(`sharedinfrastructure.md` §2), same as every other "never raise" boundary in this system — a
broadcast failure is logged and reported, never propagated into business logic.

## 4. Deduplication

Uses the same shared `Core.Cache.idempotency.check_and_mark` (`sharedinfrastructure.md` §1) that
notification dispatch uses — not a separate in-memory fingerprint cache. Key shape:
`f"ws:{event_type}:{channel}:{content_hash}"`, short TTL (e.g. 60s), to prevent a duplicate
*broadcast* from a retried in-process call. Using the same Redis-backed mechanism instead of a
per-instance in-memory cache matters specifically because an in-memory cache doesn't work across
instances — under horizontal scaling, two different Cloud Run instances each publishing the same
retried event would both think they're first, and both would broadcast. The shared, Redis-backed
check closes that gap for free, since the infrastructure already exists for notification
idempotency.

## 5. What this system deliberately does not build

- **No scheduler-driven real-time events from an in-process loop.** Everything time-based in this
  system (retention jobs, partition rotation, any future scheduled check) goes through the shared
  `Core.jobs` pattern — Cloud Scheduler hitting an authenticated endpoint
  (`sharedinfrastructure.md` §4) — never a long-lived in-process `asyncio` loop, whose correctness
  depends on one process staying alive indefinitely on a platform where instances scale to zero and
  restart.
- **No admin endpoint that broadcasts an arbitrary event/channel/payload directly.** There's no
  operational need for that capability at this system's scale, and not building it removes an
  entire class of "malformed or overly broad admin broadcast" risk for zero feature cost.
- **No unbounded fan-out primitive.** The only broadcast channel (`staff:global`) has a small,
  bounded audience — realistically single digits to low tens of connections — but delivery still
  uses a bounded concurrency gather rather than an unbounded one, so the pattern holds even if that
  changes later.
