# Production readiness

This document tracks the product-facing work that follows the completed service bridges.

## Completed in this branch

- Added an authenticated `/settings` account surface.
- Added plan and quota visibility via `/api/usage`.
- Added promo redemption UI backed by the existing server-side promo endpoint.
- Added a user-menu entry for Plan & usage.

## Production gates still to verify

- Deployment environment values and secret rotation procedure.
- PostgreSQL migration execution and backup/restore drill.
- Redis persistence/availability expectations for quota enforcement.
- Onyx and 9Router health checks, restart policies, and network isolation.
- End-to-end coverage for projects, research, memory, connectors, code execution, file generation, incognito, promo redemption, and quota failures.
- Account deletion/export and legal/privacy surfaces.
- Error tracking and operational dashboards.
