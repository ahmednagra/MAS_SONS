# M.A.S & SONS Backend — Directory Structure & Architecture

**Status**: design doc — no backend code exists yet. This defines what to build.
**Stack**: FastAPI · SQLAlchemy 2 (sync `Session`) · PostgreSQL (Cloud SQL) · Alembic · Redis (Memorystore) · Cloud Run
**Layering**: `Router → Controller → Service → Model/persistence`
**Entry point**: `main.py`
**Companion docs**: `sharedinfrastructure.md` (cross-cutting primitives every subsystem below builds
on), `emailsubsystem.md`, `notificationssubsystem.md`, `websocketsubsystem.md`, `codingconventions.md`.

This structure is deliberately aligned with `echooo-backend` — the sibling FastAPI project this
team already runs in production — rather than an independently-invented layout. Same stack, same
sync `Session` (its own `CLAUDE.md`: *"Sync SQLAlchemy `Session` only in this application; never
invent `AsyncSession`"*), same `app/Services/`, `app/Models/`, `app/Schemas/` naming conventions,
same `Router → Controller → Service → Model` layering. One deliberate departure: Controllers live
at `app/Controllers/` here, not `echooo-backend`'s `app/Http/Controllers/` — the `Http/` nesting
level buys nothing this project doesn't already get from `routes/` being the HTTP entry point, and
was dropped by explicit choice. Everything else two people who know one codebase should recognize
in the other without a translation step.

## Scope, stated up front

M.A.S & SONS is a single-company, single-stock-pool exporter of used vehicles and heavy equipment.
There is no multi-tenancy anywhere in this design — no `company_id` to isolate one customer's data
from another's, because there is only one company. The domain surface, as reconciled against the
Feature Audit and fully specified in `databaseschema.md`, is nine real areas: stock (catalog,
images, structured features), quote/sourcing requests, order fulfillment (post-acceptance shipping
tracking), buyback leads, reviews & trust, buyer account features (favorites/saved searches),
notifications, auth (multi-provider), and shipping/destinations. Every directory and table below is
sized to that — not padded to imply a bigger system, and not trimmed to cut corners on reliability.
Small domain, production-grade engineering.

## Non-functional targets

Stated explicitly because "big scale" and "never down" are meaningless without numbers to design
against:

| Concern | Target | How |
|---|---|---|
| Availability | 99.9% (≈8.7h/year downtime budget) via single-region automated failover — not 99.99%/multi-region. That tier costs materially more (cross-region replication, active-active conflict handling) and this business doesn't yet have the traffic or revenue to justify it. Revisit the number if/when it does. | Cloud SQL with a standby replica + automated failover; Cloud Run min-instances ≥ 2 so a deploy or crash never drops capacity to zero. |
| Data growth | The stock catalog itself is thousands, not millions, of live rows — a single exporter's inventory, not a marketplace aggregator. Log-shaped tables (`email_logs`, `notifications`, `audit_logs`, `websocket_connection_log`) are the ones that genuinely reach millions of rows over years of operation, and are designed for that from the first migration. | Partition all four log tables by month via one shared utility (`sharedinfrastructure.md` §4/§6); retention/archival jobs triggered by infrastructure outside the app process (see below), not an in-process timer. |
| Horizontal scaling | Stateless app tier — any Cloud Run instance can serve any request. | No in-process state that matters across requests except the WebSocket `ConnectionManager`, which is explicitly per-instance and backed by Redis for cross-instance fan-out. Sync DB calls run through a properly-sized connection pool (below) — never assumed free just because the process also happens to run async route handlers. |
| Deploys | Zero-downtime. | Cloud Run rolling revisions gated on `/health/ready`; every migration is additive/backward-compatible so the old and new revision can run against the same schema mid-rollout. |
| Failure isolation | A downstream failure (email provider outage, Redis unreachable) degrades one feature, never the whole app. | Every non-critical dependency (email send, real-time push) is wrapped so it logs and returns a typed failure instead of raising into the request/response path. |

## Top-level layout

```
Backend/
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
├── credentials/                 service-account keys, local-dev only — never committed
├── tests/                      mirrors domain grouping
└── Docs/                       backend-local supplementary docs (this folder's siblings)
```

## `app/` — application code

```
app/
├── Controllers/                 orchestration, exception translation, response shaping — thin
│   ├── StockController.py
│   ├── QuoteRequestController.py
│   ├── SourcingRequestController.py
│   ├── OrderController.py           what a quote/sourcing request becomes once accepted
│   ├── BuybackLeadController.py     domestic (Japanese) sell-to-us leads
│   ├── ReviewController.py          buyer-submitted reviews, moderation, abuse reports
│   ├── DestinationController.py     shipping/destination reference data — staff-maintained
│   ├── AuthController.py            multi-provider (password, Google, magic link) + refresh rotation
│   ├── NotificationController.py
│   ├── WebSocketController.py
│   └── admin/                        staff-only cross-domain management, grouped like echooo-backend's
│       └── AdminStockController.py, AdminOrderController.py, AdminReviewController.py
│
├── Services/                    business logic, transactions, domain rules — flat, PascalCase, one per domain
│   ├── StockService.py                   units, unit_images, features/unit_features
│   ├── QuoteRequestService.py
│   ├── SourcingRequestService.py
│   ├── OrderService.py                   shipping-status transitions drive stock.shipment_update notifications
│   ├── BuybackLeadService.py
│   ├── ReviewService.py
│   ├── DestinationService.py
│   ├── FavoriteService.py, SavedSearchService.py
│   ├── AuthService.py                    auth_identities, magic_link_tokens, refresh_tokens (rotation + reuse detection)
│   └── Notifications/                    email + in-app dispatch engine — see notificationssubsystem.md
│       ├── NotificationService.py
│       └── Email/                        see emailsubsystem.md
│           ├── EmailService.py, EmailDispatcher.py, TemplateRenderer.py
│           └── Providers/                factory/registry seam (emailsubsystem.md §2), mirrors app/Core/Storage/Providers/
│
├── Models/                      SQLAlchemy ORM models — one file per table, named for the table (plural, snake_case)
│   ├── base.py                  declarative Base
│   ├── users.py, auth_identities.py, magic_link_tokens.py, refresh_tokens.py
│   ├── units.py                 the stock catalog — vehicles and equipment, one table, `category` column
│   ├── unit_images.py           photo_type-categorized (exterior/interior/engine_bay/undercarriage/odometer/other)
│   ├── features.py, unit_features.py     structured equipment checklist (master list + confirmation junction)
│   ├── quote_requests.py, sourcing_requests.py, orders.py, order_fulfillment_details.py
│   ├── buyback_leads.py, buyback_lead_photos.py
│   ├── favorites.py, saved_searches.py
│   ├── reviews.py, review_photos.py, review_reports.py
│   ├── destinations.py
│   ├── websocket_connection_log.py
│   ├── notifications.py, notification_preferences.py, email_logs.py
│   └── audit_logs.py             system-wide, one row per action — see databaseschema.md §10
│
├── Schemas/                      Pydantic request/response schemas — one file per resource, singular, bundling
│   │                             that resource's Create/Update/Response/Filter variants (matches echooo-backend's
│   │                             app/Schemas/brand.py pattern — not one schema per file, one *resource* per file)
│   ├── stock.py, quote_request.py, sourcing_request.py, order.py, buyback_lead.py, review.py, destination.py
│   ├── auth.py                   login/register/refresh/magic-link request-response shapes
│   ├── notification.py, notification_preference.py, email.py
│   └── websocket.py
│
├── Core/                         pluggable provider abstractions only — not a general utility dumping ground
│   └── Storage/                  signed-URL file storage — unit photos, auction sheets, buyback/review photos,
│       ├── base_provider.py       identity documents (order_fulfillment_details) all go through this one seam
│       ├── storage_config.py
│       ├── storage_constants.py
│       ├── storage_factory.py
│       └── Providers/
│           └── gcs_provider.py    mirrors echooo-backend's app/Core/Storage/ exactly
│
├── WebSocket/                    see websocketsubsystem.md for whether this ships at launch
│   ├── manager.py, backplane.py, publisher.py, permissions.py, deduplication.py
│   ├── constants.py, exceptions.py
│   └── events/                   two categories: staff alerts, buyer request-status (see subsystem doc)
│
├── Middleware/
│   ├── background_tasks_context.py
│   └── csrf_middleware.py        double-submit-cookie CSRF — every public write endpoint needs this;
│                                   quote-request and buyback-lead forms are unauthenticated and the
│                                   first real abuse target
│
├── Templates/emails/
│   ├── quote_requests/, sourcing_requests/, orders/, buyback_leads/, admin/
│   └── base.html                  table-based layout, inline styles — standard for email-client rendering
│
├── Assets/                        static binary assets — fonts/logo for generated PDFs (order invoices)
│
└── Utils/                        cross-cutting primitives — where echooo-backend puts these, not under Core/
    ├── Logger.py, Helpers.py
    ├── RateLimiter.py             Redis-backed sliding-window counter — per-recipient email caps,
    │                               public-form abuse limits (mirrors echooo-backend's RateLimit.py)
    ├── Idempotency.py             check_and_mark() — atomic SET NX EX; notification dispatch dedup,
    │                               real-time broadcast dedup (sharedinfrastructure.md §1)
    ├── Retry.py                   retry_with_backoff() — email provider failover (sharedinfrastructure.md §3)
    ├── GuestContact.py            shared shape for "a recipient with no account" (sharedinfrastructure.md §5)
    ├── service_auth.py            verify_service_token() — internal job endpoint guard, mirrors
    │                               echooo-backend's app/Utils/service_auth.py exactly
    ├── partitioning.py            create_next_partition() / drop_expired_partitions() (sharedinfrastructure.md §4/§6)
    ├── startup.py, db_init.py
    └── schedulers/                retention/cleanup jobs — wired to Cloud Scheduler, not an in-process loop
```

## `routes/` — API surface

Route files register endpoints and delegate immediately to a Controller — no logic here
(`codingconventions.md` §2). Filenames are snake_case and plural, matching the resource (a hyphenated
filename can't be `import`ed as a normal Python module; the URL path itself, e.g.
`/api/v0/quote-requests`, is a string literal and independent of the module's filename).

```
routes/
├── api/
│   ├── health.py                  /health (liveness), /health/ready (readiness — checks DB + Redis)
│   └── v0/
│       ├── stock.py                list/search, detail, admin update
│       ├── quote_requests.py
│       ├── sourcing_requests.py
│       ├── orders.py               buyer/staff shipping-status views
│       ├── buyback_leads.py
│       ├── reviews.py              submission (buyer), moderation (staff)
│       ├── destinations.py
│       ├── auth.py
│       ├── notifications.py
│       ├── websocket.py
│       ├── internal/jobs.py        rotate-partitions, purge-expired-notifications — service-token guarded
│       └── admin/
└── __init__.py                    setup_api_routes()
```

## Database connection pooling — the concrete "never be down" lever most designs skip

- `config/database.py` builds one `create_engine(..., poolclass=QueuePool)` with `pool_size` and
  `max_overflow` sized so `(Cloud Run max instances × pool_size) < Cloud SQL max_connections`, with
  headroom left for Alembic/admin connections. Getting this wrong is one of the most common causes of
  a system that "randomly goes down under load" — a fleet of autoscaled instances each opening the
  default pool size independently can exhaust the database's connection limit long before the
  database itself is actually short on capacity.
- `pool_pre_ping=True` — detects a connection dropped by the database or network and transparently
  reconnects, rather than surfacing a stale-connection error to the request.
- `pool_recycle` set below Cloud SQL's own idle-connection timeout, so pooled connections are
  refreshed proactively instead of dying mid-request.
- One `sessionmaker(engine, expire_on_commit=False)` factory, injected via `Depends(get_db)` as a
  `Session` — never a module-level session. FastAPI route handlers may be declared `async def` for
  interface consistency, but the `Session` inside is sync throughout, per `codingconventions.md` §2 —
  never `AsyncSession`, matching `echooo-backend`'s own stated rule exactly.
- For read-heavy endpoints at real scale (stock search, once the catalog and traffic both justify
  it): a Cloud SQL read replica, routed to by a second, read-only session factory. Not needed at
  launch — the seam (`config/database.py` owning all session creation) is what makes adding it
  later a config change, not a refactor.

## `tests/` — mirrors domain grouping

```
tests/
├── stock/, quote_requests/, sourcing_requests/, orders/, buyback_leads/, reviews/, auth/
├── notifications/                 email + in-app dispatch behavior
└── websocket/                     connection lifecycle, channel permissions
```

## Architectural decisions, stated as decisions

- **Aligned with `echooo-backend`, not independently invented.** Same stack, same sync `Session`,
  same `app/Services/` + `app/Models/` + `app/Schemas/` naming, same `Router → Controller → Service
  → Model` layering, same `app/Utils/` home for cross-cutting primitives, same `app/Core/` reserved
  specifically for pluggable provider abstractions (`Storage/`) — with Controllers at `app/Controllers/`
  rather than `echooo-backend`'s `app/Http/Controllers/`, a deliberate one-level flattening since
  `routes/` already is this project's HTTP entry point. Anyone who has worked in one codebase reads
  the other without a translation step for everything else — the two-repo cost of inventing a second
  convention set for one small backend was never worth paying.
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
- **Idempotency, rate limiting, retry/backoff, and the guest-recipient shape are each built once, in
  `app/Utils/`, and imported everywhere.** Email, notifications and real-time push all need a version
  of each of these — building them independently per subsystem is how three near-identical Redis key
  schemes and three slightly different retry loops end up drifting apart the first time one gets a
  bug fix the others don't. See `sharedinfrastructure.md`.
