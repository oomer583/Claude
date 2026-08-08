# Production readiness

This document tracks the product-facing work that follows the completed service bridges.

## Completed

- Added an authenticated `/settings` account surface.
- Added plan and quota visibility via `/api/usage`.
- Added promo redemption UI backed by the existing server-side promo endpoint.
- Added a user-menu entry for Plan & usage.
- Added `/api/health/live` for process liveness.
- Added `/api/health/ready` for PostgreSQL, Redis, 9Router, and Onyx dependency readiness. Readiness returns HTTP 503 when any required dependency is unavailable and does not expose credentials or upstream error bodies.
- Added authenticated account-data export through `/api/account` without exposing passwords, promo hashes, encrypted credentials, or API keys.
- Added permanent product-account deletion with explicit confirmation and Onyx API-key revocation before local deletion.
- Added public `/privacy` and `/terms` information surfaces.
- Added legal/account routes to the product surface smoke check.

## Production gates still to verify

- Deployment environment values and secret rotation procedure.
- PostgreSQL migration execution and backup/restore drill.
- Redis persistence/availability expectations for quota enforcement.
- Container restart policies and internal network isolation for Onyx and 9Router.
- End-to-end coverage for projects, research, memory, connectors, code execution, file generation, incognito, promo redemption, quota failures, account export, and account deletion.
- Define final production retention windows for operational logs and backups, then align the privacy text with the deployed policy.
- Replace provisional legal text with final operator/company/contact/jurisdiction details before public launch.
- Error tracking and operational dashboards.
