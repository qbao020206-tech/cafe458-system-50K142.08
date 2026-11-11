# Cafe 458 — Back-End

API backend for the Cafe 458 ordering and shop-management system.

## Stack

- Python 3.12+, FastAPI and Pydantic
- PostgreSQL on Supabase
- SQLAlchemy 2.x async ORM with `asyncpg`
- Alembic migrations
- API routes under `/api/v1`

## Local setup

Use `uv` from the `Back-End` directory:

1. Install the pinned Python version if needed: `uv python install`.
2. Create/update `.venv` and install dependencies from `uv.lock`: `uv sync`.
3. Use the supplied `Back-End/.env` for this checkout, or copy `.env.example` to `.env` and fill the required values for another environment. Keep `.env` local; it is ignored by Git.
4. Start the API with `uv run uvicorn app.main:app --reload`.
5. Visit `/docs` for OpenAPI documentation and `/api/v1/health` for the process health check.

Add or remove dependencies with `uv add <package>` / `uv remove <package>`. Commit both `pyproject.toml` and `uv.lock` so the team resolves the same dependency versions.

The Supabase Direct Connection uses IPv6 by default. If the backend host is IPv4-only, set `DATABASE_URL` to the project's Session Pooler connection string on port 5432. Keep database credentials, JWT secrets, service-role keys, and payment account settings in `.env`; never expose them to the frontend. Bank variables are loaded as configuration only; payment-provider integration remains deferred.

## Domain model and current scope

Code is grouped by business capability, so each module owns its models, API schemas, routes, and services as that capability is implemented:

```text
app/
├── core/             # Shared settings and application errors
├── infrastructure/   # SQLAlchemy base, session factory, shared DB types
├── modules/
│   ├── auth/          # UC_1, UC_6, UC_8: owner account and session
│   ├── menu/          # UC_3.1–3.4 and UC_7.1: menu and recommendations
│   ├── orders/        # UC_2.1–2.3 and UC_7.2: order/payment lifecycle
│   ├── sales/         # UC_5.1–5.3: revenue and sales summaries
│   └── tables/        # UC_4.1–4.4: table state and QR identity
└── system/            # Health and process-level endpoints
```

The five SQLAlchemy models are owned by their domains and registered in `infrastructure/model_registry.py`: `chu_quan`, `ban`, `mon`, `don_hang`, and `chi_tiet_don`. Table, menu, and order records use soft deletion. Order items snapshot the item name and price. The order-item composite primary key remains `(ma_don_hang, ma_mon)` as specified.

The customer-order workflow checks the table QR and visible menu items, calculates prices on the server, saves item snapshots, and creates the order and serving-table state in one transaction. The owner can manage the transfer-confirmation window through the authenticated settings API. It defaults to five minutes and is persisted in `.runtime/shop-settings.json`, outside the database. Automatic bank transaction matching remains deferred; the preview can prepare a VietQR image URL, and the owner confirms receipt through the order API. A table cannot be marked empty while live unpaid orders remain; the API responds with the orders that need confirmation or cancellation.

The owner signs in through `POST /api/v1/auth/login` using `ten_dang_nhap` and `mat_khau`; credentials are checked against the bcrypt hash in `chu_quan`. The returned bearer token is required for owner endpoints. The transfer-confirmation timeout is read or changed through `GET` and `PUT /api/v1/settings/order-timeout`; the update body is `{"minutes": 5}` (allowed range: 1–1440). The recommendation settings are read or changed through `GET` and `PUT /api/v1/settings/recommendations`; defaults are three items and 30 days. Set `{"limit": 5, "lookback_days": 14}` to recommend five dishes using the previous 14 days, or `{"limit": null}` to include every qualifying dish. `lookback_days` can be from 1 to 30. Runtime settings are read from disk per request so changes take effect without restarting the API. Keep `.runtime/` on persistent local storage when deploying; on an ephemeral filesystem settings reset to their defaults after the host restarts.

## API coverage

The API catalog is implemented under `/api/v1`:

- Auth: `POST /auth/login`, `POST /auth/logout`, `PUT /auth/password`.
- Runtime settings: `GET|PUT /settings/order-timeout` and `GET|PUT /settings/recommendations`.
- Customer: `GET /customer/menu?qr_token=...`, `POST /customer/orders/preview`, `POST /customer/orders`.
- Orders: `GET /admin/orders?date=YYYY-MM-DD`, `GET /admin/orders/{id}`, `PATCH /admin/orders/{id}/confirm-payment`, `DELETE /admin/orders/{id}`, and `GET /admin/notifications/unread-orders`.
- Menu and media: `GET|POST /admin/menu`, `PUT|DELETE /admin/menu/{id}`, and `POST /admin/menu/upload-image`.
- Tables: `GET|POST /admin/tables`, `GET /admin/tables/{id}/qr-image`, `DELETE /admin/tables/{id}`, and `PATCH /admin/tables/{id}/empty`.
- Reports: `GET /admin/reports/revenue` and `GET /admin/reports/details`.

All owner routes require a bearer token. The customer menu returns the configured number of dishes with the highest paid quantity during the configured lookback period, capped at 30 days. A table cannot be marked empty while it has live, unpaid orders; the response identifies the pending orders so the owner can confirm payment or soft-delete them first. Paid orders cannot be deleted. Automatic bank transaction matching remains out of scope; the preview only prepares a VietQR image URL, and the owner confirms receipt through the order API. Uploaded menu images use the configured Supabase Storage bucket.

Revenue reports include only paid, non-deleted orders and group revenue by payment-confirmation time in Vietnam time (UTC+7). Recommendations are derived from sales data, not a menu flag. Soft-deleting an unpaid order does not change its table status.
