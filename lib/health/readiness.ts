import "server-only";

import postgres from "postgres";
import { createClient, type RedisClientType } from "redis";

type DependencyName = "postgres" | "redis" | "router" | "onyx";

type DependencyStatus = {
  latencyMs: number;
  ok: boolean;
};

export type ReadinessSnapshot = {
  checks: Record<DependencyName, DependencyStatus>;
  ok: boolean;
  timestamp: string;
};

const HEALTH_TIMEOUT_MS = 5000;

let postgresClient: ReturnType<typeof postgres> | null = null;
let redisClient: RedisClientType | null = null;
let redisConnectPromise: Promise<RedisClientType> | null = null;

function getPostgresClient() {
  const url = process.env.POSTGRES_URL?.trim();
  if (!url) {
    throw new Error("POSTGRES_URL is not configured");
  }

  postgresClient ??= postgres(url, {
    connect_timeout: 5,
    idle_timeout: 20,
    max: 2,
  });
  return postgresClient;
}

async function getRedisClient() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    throw new Error("REDIS_URL is not configured");
  }

  if (redisClient?.isReady) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    const client = createClient({ url });
    client.on("error", (error) => {
      console.error("Health Redis error", error);
    });
    redisConnectPromise = client.connect().then(() => {
      redisClient = client as RedisClientType;
      return redisClient;
    });
  }

  try {
    return await redisConnectPromise;
  } catch (error) {
    redisConnectPromise = null;
    throw error;
  }
}

function getRouterHealthUrl() {
  const configured = process.env.ROUTER_BASE_URL?.trim();
  if (!configured) {
    throw new Error("ROUTER_BASE_URL is not configured");
  }

  const url = new URL(configured);
  url.pathname = `${url.pathname.replace(/\/v1\/?$/, "").replace(/\/$/, "")}/api/health`;
  url.search = "";
  return url.toString();
}

function getOnyxHealthUrl() {
  const configured = process.env.ONYX_BASE_URL?.trim();
  if (!configured) {
    throw new Error("ONYX_BASE_URL is not configured");
  }

  return `${configured.replace(/\/$/, "")}/health`;
}

async function timedCheck(
  check: () => Promise<void>
): Promise<DependencyStatus> {
  const startedAt = performance.now();
  try {
    await check();
    return {
      latencyMs: Math.round(performance.now() - startedAt),
      ok: true,
    };
  } catch {
    return {
      latencyMs: Math.round(performance.now() - startedAt),
      ok: false,
    };
  }
}

async function fetchHealth(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Health check failed with ${response.status}`);
  }
}

export async function getReadinessSnapshot(): Promise<ReadinessSnapshot> {
  const [postgresStatus, redisStatus, routerStatus, onyxStatus] =
    await Promise.all([
      timedCheck(async () => {
        await getPostgresClient()`select 1`;
      }),
      timedCheck(async () => {
        const client = await getRedisClient();
        await client.ping();
      }),
      timedCheck(async () => {
        await fetchHealth(getRouterHealthUrl());
      }),
      timedCheck(async () => {
        await fetchHealth(getOnyxHealthUrl());
      }),
    ]);

  const checks = {
    onyx: onyxStatus,
    postgres: postgresStatus,
    redis: redisStatus,
    router: routerStatus,
  };

  return {
    checks,
    ok: Object.values(checks).every((check) => check.ok),
    timestamp: new Date().toISOString(),
  };
}
