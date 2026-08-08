# Self-hosting

This is the shortest supported path to get the product running as a website while keeping the full server-side architecture.

## What Compose manages

`compose.yaml` starts:

- the Next.js application,
- PostgreSQL with a persistent volume,
- Redis with AOF persistence.

9Router and Onyx stay as dedicated services. Point `ROUTER_BASE_URL` and `ONYX_BASE_URL` at the instances you run for those projects. This keeps their upstream deployment model independent instead of copying their internals into this repository.

## 1. Create `.env`

Copy `.env.example` to `.env` and set all required values. For the Compose-managed database, also set:

```env
POSTGRES_USER=claude
POSTGRES_PASSWORD=replace-with-a-long-random-password
POSTGRES_DB=claude
APP_PORT=3000
```

`POSTGRES_URL` and `REDIS_URL` from `.env` are overridden inside the app container so it uses the Compose service names.

Validate the important values before starting:

```bash
node --env-file=.env scripts/check-env.mjs
```

## 2. Start the website stack

```bash
docker compose up -d --build
```

The app container runs product database migrations before `next start`. PostgreSQL and Redis must pass their own health checks before the app starts.

## 3. Verify it

```bash
APP_URL=http://127.0.0.1:3000 node scripts/smoke-health.mjs
```

- `/api/health/live` confirms the Next.js process is responding.
- `/api/health/ready` confirms PostgreSQL, Redis, 9Router and Onyx are reachable.

If readiness fails, inspect the named dependency in the JSON response instead of guessing.

## 4. Put a public URL in front of it

The application listens on `APP_PORT` (default `3000`). A reverse proxy, tunnel, or hosting-provided HTTPS subdomain can point to that port. Keep PostgreSQL, Redis, Onyx admin credentials, 9Router credentials and all internal service ports private.

## Useful commands

```bash
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete PostgreSQL and Redis volumes.
