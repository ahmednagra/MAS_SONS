# M.A.S & SONS Backend — Coding Conventions

**Status**: design doc, agreed before implementation starts. Governs every `.py` file written under
`Backend/` from this point on. Builds on `directorystructure.md` (layering, layout) and
`databaseschema.md`/`sharedinfrastructure.md` (what each layer actually calls).

**Aligned with `echooo-backend`.** Every naming and layering rule below was checked against that
project's actual code (`app/Http/Controllers/BrandController.py`, `app/Services/BrandService.py`,
`app/Models/brands.py`, `app/Schemas/brand.py`, its own `CLAUDE.md`) rather than invented from
scratch — the two backends should read as the same house style.

## 1. File header — every `.py` file, no exceptions

```python
# app/Models/units.py

# SQLAlchemy model for the units table — the stock catalog (databaseschema.md §2).
```

Line 1 is the file's own path as a comment — `echooo-backend` already does this on some files
(`app/Http/Controllers/BrandController.py`, `app/Utils/service_auth.py`) and it's worth making
universal here: a comment costs nothing at import time, and it's what makes a pasted code excerpt
traceable back to its file without a Ctrl-F. Line 2 is blank. Line 3 is one line naming what the
file is for, cross-referencing the design doc section it implements where one exists.

**No comments beyond that, except a short docstring on a class or function definition where the
name alone doesn't say enough.** The file header explains the file; a one-line (occasionally
two-line) docstring explains a class or function when its purpose isn't obvious from its name and
signature. Nothing else gets a comment — not a line inside a function body, not a bullet list of
reasoning next to a query or a constraint. If a piece of logic genuinely needs that much
explanation, that reasoning belongs in the design doc it already cites (`databaseschema.md`,
`sharedinfrastructure.md`, ...), not scattered through the implementation as inline prose. Frontend
`.ts`/`.tsx` files follow the same shape: a one-line file-top comment where the file's purpose isn't
obvious from its path, then no further comments.

## 2. Naming — one convention per layer, matching `echooo-backend` exactly

| Layer | Location | Naming | Example |
|---|---|---|---|
| Route | `routes/api/v0/` | snake_case, plural, matches the resource | `quote_requests.py` |
| Controller | `app/Controllers/` | PascalCase, `<Resource>Controller.py` | `QuoteRequestController.py` |
| Service | `app/Services/` | PascalCase, `<Resource>Service.py` | `QuoteRequestService.py` |
| Model | `app/Models/` | snake_case, **plural**, matches the table name | `quote_requests.py` → class `QuoteRequest` |
| Schema | `app/Schemas/` | snake_case, **singular**, one file per resource bundling all its variants | `quote_request.py` → `QuoteRequestCreate`, `QuoteRequestResponse`, ... |

The Model/Schema split (plural file for the table, singular file for the resource) is deliberate,
not arbitrary — `echooo-backend` draws exactly this line (`app/Models/brands.py` vs.
`app/Schemas/brand.py`): a Model file is named for the table it maps, a Schema file is named for the
one thing it represents. A resource's Create/Update/Response/Filter/List schemas all live in that
one file, imported together (`from app.Schemas.quote_request import QuoteRequestCreate,
QuoteRequestResponse, ...`) — not one file per schema class, which is how `echooo-backend`'s
`app/Schemas/brand.py` is actually organized.

`app/Controllers/` and `app/Services/` are **flat** — one file per resource, no per-domain
subfolder — except where a domain genuinely has enough controllers to warrant grouping (mirroring
`echooo-backend`'s equivalent `app/Http/Controllers/billing/`, `admin/`, etc. — MAS_SONS drops the
`Http/` nesting level itself, but keeps the same flat-with-domain-exceptions shape); at this
system's nine-domain scale, only `admin/` (staff-only cross-domain management) is large enough to
earn a subfolder.

## 3. Layering contract — where logic is allowed to live, and who raises what

```
routes/api/v0/*.py  →  app/Controllers/*Controller.py  →  app/Services/*Service.py  →  app/Models/*.py
```

| Layer | Owns | Never does |
|---|---|---|
| **Route** | Path, method, `response_model`, dependency wiring (`Depends(get_db)`, `Depends(get_current_user)`). One line per operation: call the Controller, return what it returns. | Business logic, try/except, direct Model/Service imports beyond the Controller call. |
| **Controller** | Thin delegation to the Service; catches unexpected exceptions, logs via `app/Utils/Logger.py`, and re-raises — matching `echooo-backend`'s actual `BrandController` pattern (`try: return await XService.method(...) except Exception as e: logger.error(...); raise`). Shapes the success response schema. | Own business-error raising as a *rule* — a Service already raises the right `HTTPException` for a domain error (see below); the Controller's `except` is a safety net and a logging point, not the primary error path. |
| **Service** | All business logic: queries, transactions, invariants. **Raises `HTTPException` directly for domain errors** on any Service that's only ever called from inside an HTTP request (Stock, QuoteRequest, Order, Review, Auth, ...) — the same pattern `echooo-backend`'s `BrandService.py` uses. **Returns `OperationResult`, never raises,** on any Service reachable *without* an HTTP context — `EmailDispatcher`, `NotificationDispatcher`, WebSocket `publish()` (`sharedinfrastructure.md` §2) — there is no response to attach an exception to from a background task. | Raise `HTTPException` from a background-callable Service, or return `OperationResult` from an HTTP-only one — picking the wrong one for the call site is the actual mistake, not picking `HTTPException` or `OperationResult` in the abstract. |
| **Model** | SQLAlchemy 2.0 mapped classes: columns, relationships, `__tablename__`, and only computation that's genuinely a property of the row (a `hybrid_property`, never a query). | Business rules, cross-table orchestration. |

A request that touches two tables (e.g. creating an `Order` from a `QuoteRequest`) is one Service
method wrapping one transaction — never two Controller calls stitched together, which would split an
atomic operation across two separate DB round-trips with no shared transaction boundary.

**Sync `Session` throughout — never `AsyncSession`.** `echooo-backend`'s own `CLAUDE.md` states this
as a hard rule ("Sync SQLAlchemy `Session` only in this application; never invent `AsyncSession`"),
and this backend follows it for the same reason: one connection-pooling model to reason about, no
mixed sync/async footguns, and consistency with the sibling codebase this team already maintains.
Route handlers and Controller methods may be declared `async def` for interface consistency with
FastAPI (matching `echooo-backend`'s own `BrandController` methods), but the `Session` passed through
them is always sync — nothing here awaits a database call.

## 4. `__init__.py` — a real export surface, not a marker

Every package's `__init__.py` re-exports its public names, so callers import from the package, never
reach into a submodule:

```python
# app/Models/__init__.py

# Single import surface for every ORM model — also what alembic/env.py imports for autogenerate.
from app.Models.users import User
from app.Models.units import Unit
from app.Models.quote_requests import QuoteRequest
# ... one line per model, ordered to match databaseschema.md's own section order

__all__ = ["User", "Unit", "QuoteRequest", ...]
```

```python
# app/Services/__init__.py

from app.Services.StockService import StockService
from app.Services.QuoteRequestService import QuoteRequestService

__all__ = ["StockService", "QuoteRequestService", ...]
```

This buys two concrete things: `from app.Models import Unit, User` everywhere instead of memorizing
which submodule owns which class, and one place (`app/Models/__init__.py`) for Alembic's `env.py` to
import so `Base.metadata` sees every table without a hand-maintained list drifting out of date.

## 5. No hard-coding — one source per fact

- **Tunables** (page size caps, rate-limit thresholds, TTLs, retry counts, connection pool size) are
  `pydantic-settings` fields in `config/settings.py`, env-overridable, never a bare literal in a
  Service or Controller. A Service reads `settings.STOCK_PAGE_SIZE_MAX`, not `50`.
- **Enum-like strings** (`unit.status`, `order.shipping_status`, etc.) are `StrEnum` classes in a
  shared `app/Utils/Enums.py`, one per CHECK constraint in `databaseschema.md` §11 — a Service
  compares `UnitStatus.IN_STOCK`, never the string `"in_stock"` retyped at each call site. The
  Pydantic schema, the SQLAlchemy `CheckConstraint`, and the enum all derive from the same list, so
  adding a value is one edit, not a grep-and-hope across the codebase.
- **Notification/event types** stay a code registry (`NOTIFICATION_TYPES` — already decided in
  `notificationssubsystem.md` §3), for the same reason.

## 6. Query performance — the actual point of a "senior" implementation here

- SQLAlchemy 2.0 `select()` style throughout; explicit column lists on hot paths instead of loading
  full ORM rows when a query only needs 3 of 14 columns (e.g. the stock list view).
- Relationships are loaded with an explicit `selectinload`/`joinedload` chosen per endpoint — never
  left to lazy-load inside a request. Lazy-loading in a request path is exactly how an N+1 gets into
  production invisibly; it's a decision to make once per query, at the Service call site, not an
  accident of the default.
- **Bulk over loop, and one transaction per related write-set — applied by what the operation
  actually is, not one rule stretched to cover both:**
  - *Naturally bulk work* (confirming 8 features on a unit, fanning a digest out to N saved-search
    subscribers) is one `session.execute(insert(unit_features), [...])` with all N rows, not N
    round-trips.
  - *A multi-table business operation* (a `QuoteRequest` converting into an `Order`) is one Service
    method that opens one transaction (`with db.begin():` or the ambient transaction under
    `Depends(get_db)`, per whatever `config/database.py` establishes) and does every write for that
    operation inside it — never two Controller calls stitched together with no shared transaction,
    which leaves a window where the quote is marked converted but the order was never created if the
    second write fails.
  - The two compose: a multi-table operation that also has a bulk component (creating an `Order` plus
    its N `unit_features` confirmations) does the bulk insert *inside* the same transaction, not as a
    separate call after it commits.
- List endpoints paginate on an indexed column (already the `StockSearchParams` convention) — never
  `OFFSET` on a table that can grow past a few thousand rows.
- Every query added to a Service is checked against the index that's supposed to serve it
  (`databaseschema.md`'s per-table `CREATE INDEX` lines) *before* it ships — a query with no matching
  index is a sequential scan waiting to happen the day the table stops being tiny.
- The Service layer takes its `Session` via dependency injection (`Depends(get_db)`), never imports a
  module-level session — this is what makes routing read traffic to a future read replica
  (`directorystructure.md`'s connection-pooling section) a config change, not a rewrite.

## 7. Worked example — one endpoint, full chain

```python
# routes/api/v0/stock.py

# Stock catalog routes — list/search and single-unit detail.
@router.get("/stock/{slug}", response_model=UnitResponse)
async def get_unit(slug: str, db: Session = Depends(get_db)):
    return await StockController.get_by_slug(slug, db)
```

```python
# app/Controllers/StockController.py

# Thin delegation to StockService; logs and re-raises anything unexpected.
class StockController:
    @staticmethod
    async def get_by_slug(slug: str, db: Session) -> UnitResponse:
        try:
            return await StockService.get_by_slug(slug, db)
        except Exception as e:
            logger.error(f"Error in get_by_slug: {e}")
            raise
```

```python
# app/Services/StockService.py

# Stock catalog business logic — raises HTTPException directly; always called inside a request.
class StockService:
    @staticmethod
    async def get_by_slug(slug: str, db: Session) -> UnitResponse:
        stmt = (
            select(Unit)
            .where(Unit.slug == slug, Unit.deleted_at.is_(None))
            .options(selectinload(Unit.images), selectinload(Unit.features))
        )
        unit = db.execute(stmt).scalar_one_or_none()
        if unit is None:
            raise HTTPException(status_code=404, detail="Unit not found")
        return UnitResponse.model_validate(unit)
```

One indexed lookup (`uq_units_slug`), one query with both relationships eager-loaded in the same
round-trip, no business logic above the Service, and the domain error (`404`) raised at the one
layer that's always inside a request.

A multi-table example — converting a `QuoteRequest` into an `Order` — shows the transaction rule:

```python
# app/Services/OrderService.py

# Order creation from an accepted quote request — one atomic multi-table write.
class OrderService:
    @staticmethod
    async def create_from_quote(quote_request_id: int, db: Session) -> OrderResponse:
        with db.begin():
            quote = db.get(QuoteRequest, quote_request_id)
            if quote is None or quote.status != QuoteStatus.QUOTED:
                raise HTTPException(status_code=409, detail="Quote is not in a convertible state")
            order = Order(
                quote_request_id=quote.id, unit_id=quote.unit_id, user_id=quote.user_id,
                contact_name=quote.contact_name, contact_email=quote.contact_email,
                final_price_usd=quote.quoted_price_usd, incoterm=quote.incoterm,
                destination_country=quote.destination_country,
            )
            db.add(order)
            quote.status = QuoteStatus.CLOSED
            # commits on exiting the `with` block with no exception — both writes land
            # together, or neither does.
        return OrderResponse.model_validate(order)
```

And the background-context example — where `OperationResult` is the right shape *because* there's no
request to raise into:

```python
# app/Services/Notifications/Email/EmailDispatcher.py

# Retry/failover orchestration — never raises; there is no HTTP response to raise into here.
class EmailDispatcher:
    @staticmethod
    def dispatch(message: EmailMessage) -> OperationResult:
        return retry_with_backoff(
            fn=lambda: PrimaryProvider().send(message),
            classify=email_error_classifier,
            max_attempts=4,
        )
```
