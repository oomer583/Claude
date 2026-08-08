# Production readiness

This document tracks the product-facing work that follows the completed service bridges.

## Completed

- Added an authenticated `/settings` account surface.
- Added plan and live quota visibility via `/api/usage`, including current usage, remaining allowance, and reset time for bounded plans.
- Added promo redemption UI backed by the existing server-side promo endpoint.
- Added a user-menu entry for Plan & usage.
- Added `/api/health/live` for process liveness.
- Added `/api/health/ready` for PostgreSQL, Redis, 9Router, and Onyx dependency readiness.
- Added authenticated account-data export and permanent account deletion with Onyx credential revocation.
- Added public `/privacy` and `/terms` information surfaces.
- Added authenticated `deploy:functional` verification for usage, memory, connectors, projects, account export, web search, deep research, code execution, file generation/download, quota deltas, project lifecycle, memory lifecycle, MCP actions, promo redemption, and optional real 429 quota-boundary checks.
- Added custom named response styles with one active style injected server-side into normal chats.
- Added past-chat search across saved titles and serialized message content, scoped to the signed-in user.
- Added real DOCX/XLSX/PPTX/PDF editing through the existing Onyx Code Interpreter bridge using temporary project/file staging and cleanup.
- Added active E2E coverage that generates a PDF, sends that real file through the editing endpoint, and verifies the edited download URL.
- Documented the supported **single physical server** topology: Caddy + app + PostgreSQL + Redis + 9Router + Onyx on one host. A second VPS is not required.
- Removed the obsolete legacy user-type entitlement table so Redis-backed product quotas remain the single quota implementation.

## Final live-host checks

These are deployment actions rather than another feature-development package:

- Put the real deployment secrets in `.env`.
- Start 9Router and Onyx on the same physical server.
- Run PostgreSQL migrations through the normal app startup/build path.
- Point the chosen free hostname/subdomain to the server and let Caddy obtain HTTPS.
- Run `deploy:check`, `deploy:preflight`, `deploy:smoke`, `deploy:features`, and authenticated `deploy:functional` against the actual URL.
- If a live-host check exposes a blocker, fix only that blocker before using the site.

Longer-term operational items such as formal backup drills, final public legal/operator text, and external observability dashboards are not required to begin using the site privately on the single server.
