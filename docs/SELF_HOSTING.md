# Self-hosting fastlane

This is the shortest supported path to run the full product as a website without dropping the server-side architecture.

## What this repository starts

`compose.yaml` starts the Next.js application, PostgreSQL, Redis, and Caddy. PostgreSQL and Redis are isolated on an internal Docker network. Caddy is the only service intended to accept public traffic.

9Router and Onyx remain dedicated upstream services. The app reaches them through `ROUTER_BASE_URL` and `ONYX_BASE_URL`. If they run directly on the same Linux server, `host.docker.internal` is mapped automatically inside the app container.

## 1. Create secrets and `.env`

Copy `.env.example` to `.env`.

Generate the local secrets in one command:

```bash
pnpm deploy:secrets
```

Copy the generated values into `.env`, then add the real 9Router API key, Onyx admin API key, and any storage credentials you use.

Validate the deployment environment:

```bash
pnpm deploy:check
```

## 2. Point at 9Router and Onyx

For services published on the same host, the defaults can look like:

```env
ROUTER_BASE_URL=http://host.docker.internal:20128/v1
ONYX_BASE_URL=http://host.docker.internal:8080
```

Use the actual published ports from those services. Do not expose their admin/API ports to the public internet just to make this app work.

## 3. Start everything managed here

```bash
docker compose up -d --build
```

The app waits for PostgreSQL and Redis health checks, runs product database migrations, and then starts Next.js. Caddy waits for the app health check before proxying traffic.

Verify authenticated upstream connectivity from inside the running app container:

```bash
pnpm deploy:preflight
```

This checks 9Router health, authenticated `/v1/models`, Onyx health, and authenticated Onyx `/me` access. It fails without printing credentials or upstream response bodies.

## 4. Public URL and HTTPS

For a quick local HTTP test, keep:

```env
SITE_ADDRESS=:80
```

For a real free hostname or subdomain, point its DNS record to the server and set only the hostname:

```env
SITE_ADDRESS=my-ai.example.org
```

Then apply it:

```bash
docker compose up -d
```

Caddy obtains and renews HTTPS automatically when the hostname resolves to the server and ports 80/443 are reachable. The raw Next.js port is bound to `127.0.0.1` only; public traffic goes through Caddy.

## 5. Health and product-surface smoke tests

Local app port:

```bash
APP_URL=http://127.0.0.1:3000 pnpm deploy:smoke
```

Public HTTPS hostname:

```bash
APP_URL=https://my-ai.example.org pnpm deploy:smoke
SITE_URL=https://my-ai.example.org pnpm deploy:features
```

The health smoke test checks `/api/health/live` and `/api/health/ready`. Readiness includes PostgreSQL, Redis, 9Router, and Onyx. The product-surface smoke test verifies that the main public/authenticated routes exist and do not return 404/5xx responses.

## 6. Authenticated functional verification

Sign in through the browser, open Developer Tools, and copy the full `Cookie` request-header value from any authenticated request. Run the read-only verification first:

```bash
SITE_URL=https://my-ai.example.org \
E2E_SESSION_COOKIE='authjs.session-token=...; other-cookie=...' \
pnpm deploy:functional
```

The read-only pass verifies the authenticated usage snapshot, memory read path, connector discovery, project list, and account export. It also checks that account export does not contain password or encrypted workspace credentials.

To perform real active probes against the configured services, opt in explicitly:

```bash
SITE_URL=https://my-ai.example.org \
E2E_SESSION_COOKIE='authjs.session-token=...; other-cookie=...' \
E2E_ACTIVE=1 \
pnpm deploy:functional
```

Active mode runs a small real web search, isolated Python execution, PDF generation plus generated-file URL reachability, and a small deep-research request. It then fetches `/api/usage` again and verifies that Redis-backed counters increased for every exercised resource. Active probes consume the same quota and upstream resources as normal product use.

Never commit the copied session cookie or put it in shell history on a shared machine.

## Useful commands

```bash
docker compose ps
docker compose logs -f app caddy
docker compose restart app caddy
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to delete PostgreSQL, Redis, and Caddy state volumes.
