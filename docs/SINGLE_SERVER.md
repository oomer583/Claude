# Single-server topology

This product does **not** require a second VPS. The supported small self-hosted layout runs every required service on one physical Linux server.

## One machine, multiple isolated services

Run these on the same server:

- Caddy: public ports 80/443 only.
- Next.js product app: Docker, bound to localhost/internal networks.
- PostgreSQL: Docker internal network only.
- Redis: Docker internal network only.
- 9Router: same host, normally published only to the host on port 20128.
- Onyx + its own required workers/sandbox services: same host, with the backend reachable by the product at port 8080.

The product app container already has `host.docker.internal:host-gateway`, so it can call 9Router and Onyx running elsewhere on the **same machine** without exposing their APIs to the public internet.

Use these values in `.env` when both upstreams run on the same server:

```env
ROUTER_BASE_URL=http://host.docker.internal:20128/v1
ONYX_BASE_URL=http://host.docker.internal:8080
```

## Public exposure

Only Caddy should be internet-facing. Do not open PostgreSQL, Redis, the 9Router admin/API port, or the Onyx backend port to the internet. If the upstream stacks publish ports, bind them to `127.0.0.1` or protect them with the host firewall.

## Start order

1. Start 9Router on this server.
2. Start Onyx and its Code Interpreter dependencies on this server.
3. Put the product `.env` in place.
4. Run `pnpm deploy:check`.
5. Run `docker compose up -d --build`.
6. Run `pnpm deploy:preflight`.
7. Point the free hostname/subdomain to this server and set `SITE_ADDRESS`.
8. Run `pnpm deploy:smoke`, `pnpm deploy:features`, then authenticated `pnpm deploy:functional`.

No second server is part of this architecture. Extra machines are only an optional future scaling choice.
