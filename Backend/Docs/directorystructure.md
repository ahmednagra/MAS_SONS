# M.A.S & SONS Backend — Directory Structure & Architecture

**Status**: design doc — no backend code exists yet. This defines what to build.
**Stack**: FastAPI · SQLAlchemy 2 (sync) · PostgreSQL (Cloud SQL) · Alembic · Redis (Memorystore) · Cloud Run
**Layering**: `Router → Controller → Service → Model/persistence`
**Entry point**: `main.py`
**Companion docs**: `sharedinfrastructure.md` (the `app/Core/` primitives every subsystem below
builds on), `emailsubsystem.md`, `notificationssubsystem.md`, `websocketsubsystem.md`.

## Scope, stated up front

M.A.S & SONS is a single-company, single-stock-pool exporter of used vehicles and heavy equipment.
There is no multi-tenancy anywhere in this design — no `company_id` to isolate one customer's data
from another's, because there is only one company. The domain surface is six real areas: stock,
quote requests, sourcing requests, buyback leads, notifications, auth. Every directory and table
below is sized to that — not padded to imply a bigger system, and not trimmed to cut corners on
reliability. Small domain, production-grade engineering.

## Non-functional targets

Stated explicitly because "big scale" and "never down" are meaningless without numbers to design
against:

| Concern | Target | How |
|---|---|---|
| Availability | 99.9% (≈8.7h/year downtime budget) via single-region automated failover — not 99.99%/multi-region. That tier costs materially more (cross-region replication, active-active conflict handling) and this business doesn't yet have the traffic or revenue to justify it. Revisit the number if/when it does. | Cloud SQL with a standby replica + automated failover; Cloud Run min-instances ≥ 2 so a deploy or crash never drops capacity to zero. |
| Data growth | The stock catalog itself is thousands, not millions, of live rows — a single exporter's inventory, not a marketplace aggregator. Log-shaped tables (`email_logs`, `notifications`, audit history) are the ones that genuinely reach millions of rows over years of operation, and are designed for that from the first migration. | Partition log tables by month; retention/archival jobs triggered by infrastructure outside the app process (see below), not an in-process timer. |
| Horizontal scaling | Stateless app tier — any Cloud Run instance can serve any request. | No in-process state that matters across requests except the WebSocket `ConnectionManager`, which is explicitly per-instance and backed by Redis for cross-instance fan-out. |
| Deploys | Zero-downtime. | Cloud Run rolling revisions gated on `/health/ready`; every migration is additive/backward-compatible so the old and new revision can run against the same schema mid-rollout. |
| Failure isolation | A downstream failure (email provider outage, Redis unreachable) degrades one feature, never the whole app. | Every non-critical dependency (email send, real-time push) is wrapped so it logs and returns a typed failure instead of raising into the request/response path. |

## Top-level layout

```
mas-sons-backend/
├── main.py                    FastAPI app, lifespan (startup/shutdown), middleware wiring
├── manage.py, migrate.py      CLI utilities
├── check_env.py               env validation — fail fast on missing/malformed config at boot
├── alembic.ini
├── Makefile                   make dev / make test / make deploy — the quality gate lives here
├── requirements.txt
├── pyproject.toml, pytest.ini, .flake8
├── docker-compose.yml         local Postgres + Redis for dev
├── cloudbuild.yaml, deploy.sh
├── .env.example                 never commit a real .env
├── config/
│   ├── settings.py             pydantic-settings, env-driven, validated at import time
│   ├── database.py             SQLAlchemy engine + session factory, pool sizing (see below)
│   └── email.py                provider selection
├── app/                        application code (below)
├── routes/                     API route registration
├── alembic/versions/
├── scripts/                    one-off data import/migration scripts
├── tests/                      mirrors domain grouping
└── docs/                       backend-local supplementary docs (this folder's siblings)
```

## `app/` — application code

```
app/
├── Core/                         shared cross-cutting infrastructure — see sharedinfrastructure.md
│   ├── Cache/                    redis_client.py, idempotency.py, rate_limiter.py
│   ├── results.py                OperationResult — the one "never raise" return shape
│   ├── retry.py                  retry_with_backoff()
│   ├── guest_contact.py          GuestContact — the one shape for "a recipient with no account"
│   └── jobs/                     auth.py (service-token guard), partitioning.py
│
├── Controllers/                 orchestration, schema mapping, exception translation
│   ├── stock/
│   ├── quote_requests/
│   ├── sourcing_requests/       "Request a Car" — auction-sourcing inquiries
│   ├── buyback_leads/           domestic (Japanese) sell-to-us leads
│   ├── admin/                   staff-only stock/lead management
│   ├── auth/
│   └── WebSocketController.py
│
├── Services/                    business logic, transactions, domain rules
│   ├── Stock/
│   ├── QuoteRequests/
│   ├── SourcingRequests/
│   ├── BuybackLeads/
│   ├── Notifications/           email + in-app dispatch engine — see notificationssubsystem.md
│   │   └── Email/                see emailsubsystem.md
│   ├── Auth/
│   └── Utils/
│
├── Models/                      SQLAlchemy ORM models
│   ├── unit.py                  the stock catalog — vehicles and equipment, one table, `category` column
│   ├── quote_request.py, sourcing_request.py, buyback_lead.py
│   ├── user.py                  optional buyer account — favorites/saved-search/history only, never required to buy
│   ├── favorite.py, saved_search.py
│   ├── notification.py, notification_preference.py, email_log.py
│   └── audit_log.py             who changed a unit's price/status, and when
│
├── Schemas/                      Pydantic request/response schemas, mirrors Services
│   ├── stock/, quote_requests/, sourcing_requests/, buyback_leads/
│   ├── notifications/            email.py, notification.py, notification_preference.py
│   └── websocket.py
│
├── WebSocket/                    see websocketsubsystem.md for whether this ships at launch
│   ├── manager.py, backplane.py, publisher.py, permissions.py, deduplication.py
│   └── events/                   two categories: staff alerts, buyer request-status (see subsystem doc)
│
├── Middleware/
│   ├── background_tasks_context.py
│   └── csrf_middleware.py        double-submit-cookie CSRF — every public write endpoint needs this;
│                                   quote-request and buyback-lead forms are unauthenticated and the
│                                   first real abuse target
│
├── Templates/emails/
│   ├── quote_requests/, sourcing_requests/, buyback_leads/, admin/
│   └── base.html                  table-based layout, inline styles — standard for email-client rendering
│
└── Utils/
    ├── Logger.py, Helpers.py, startup.py, db_init.py
    └── schedulers/                retention/cleanup jobs — wired to Cloud Scheduler, not an in-process loop
```

## `routes/` — API surface

```
routes/
├── api/
│   ├── health.py                  /health (liveness), /health/ready (readiness — checks DB + Redis)
│   └── v0/
│       ├── stock.py                list/search, detail, admin update
│       ├── quote-requests.py
│       ├── sourcing-requests.py
│       ├── buyback-leads.py
│       ├── auth.py
│       ├── notifications.py
│       ├── websocket.py
│       └── admin/
└── __init__.py                    setup_api_routes()
```

## Database connection pooling — the concrete "never be down" lever most designs skip

- `config/database.py` uses SQLAlchemy's `QueuePool` with `pool_size` and `max_overflow` sized so
  `(Cloud Run max instances × pool_size) < Cloud SQL max_connections`, with headroom left for
  Alembic/admin connections. Getting this wrong is one of the most common causes of a system that
  "randomly goes down under load" — a fleet of autoscaled instances each opening the default pool
  size independently can exhaust the database's connection limit long before the database itself is
  actually short on capacity.
- `pool_pre_ping=True` — detects a connection dropped by the database or network and transparently
  reconnects, rather than surfacing a stale-connection error to the request.
- `pool_recycle` set below Cloud SQL's own idle-connection timeout, so pooled connections are
  refreshed proactively instead of dying mid-request.
- For read-heavy endpoints at real scale (stock search, once the catalog and traffic both justify
  it): a Cloud SQL read replica, routed to by a second, read-only session factory. Not needed at
  launch — the seam (`config/database.py` owning all session creation) is what makes adding it
  later a config change, not a refactor.

## `tests/` — mirrors domain grouping

```
tests/
├── stock/, quote_requests/, sourcing_requests/, buyback_leads/, auth/
├── notifications/                 email + in-app dispatch behavior
└── websocket/                     connection lifecycle, channel permissions
```

## Architectural decisions, stated as decisions

- **Layered architecture (Router → Controller → Service → Model).** Keeps the codebase navigable
  as the domain grows, and keeps business logic out of route handlers and ORM models alike.
- **No multi-tenant scoping anywhere.** There is one company. A `company_id` column or tenant check
  would be dead code from day one — deliberately not built.
- **Notification/event types defined as a code registry, not a database table.** A new type is a
  reviewed pull request, not a silent runtime data change — the right trade-off for a domain where
  types change rarely and correctness matters more than runtime configurability.
- **Redis is provisioned from day one**, independent of whether real-time push ships at launch,
  because Cloud Run horizontal scaling needs a shared layer for more than push events — it's also
  the home for rate limiting and the notification-deduplication cache described in
  `notificationssubsystem.md`.
- **Retention/cleanup jobs run on Cloud Scheduler hitting an authenticated endpoint, never an
  in-process `asyncio` loop.** An in-process scheduler's correctness depends on one specific process
  staying alive indefinitely — a fragile assumption on a platform like Cloud Run, where instances
  scale to zero and restart routinely. Designing the trigger to live outside the app process from
  the first version avoids a class of "the job silently never ran" failure entirely.
- **Idempotency, rate limiting, retry/backoff, the "never raise" result type, and the
  guest-recipient shape are each built once, in `app/Core/`, and imported everywhere.** Email,
  notifications and real-time push all need a version of each of these — building them
  independently per subsystem is how three near-identical Redis key schemes and three slightly
  different retry loops end up drifting apart the first time one gets a bug fix the others don't.
  See `sharedinfrastructure.md`.
