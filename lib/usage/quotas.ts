import "server-only";

import { createClient, type RedisClientType } from "redis";
import { getUserEntitlement } from "@/lib/db/promocodes";

export type QuotaResource =
  | "messages"
  | "research"
  | "uploads"
  | "code"
  | "fileGeneration"
  | "webSearch"
  | "mcp";

type Plan = "free" | "premium" | "owner";

type QuotaRule = {
  limit: number;
  windowSeconds: number;
};

const MONTH_SECONDS = 30 * 24 * 60 * 60;
const DAY_SECONDS = 24 * 60 * 60;
const HOUR_SECONDS = 60 * 60;

const PLAN_QUOTAS: Record<Exclude<Plan, "owner">, Record<QuotaResource, QuotaRule>> = {
  free: {
    code: { limit: 10, windowSeconds: HOUR_SECONDS },
    fileGeneration: { limit: 10, windowSeconds: DAY_SECONDS },
    mcp: { limit: 50, windowSeconds: DAY_SECONDS },
    messages: { limit: 10, windowSeconds: HOUR_SECONDS },
    research: { limit: 3, windowSeconds: MONTH_SECONDS },
    uploads: { limit: 20, windowSeconds: DAY_SECONDS },
    webSearch: { limit: 50, windowSeconds: DAY_SECONDS },
  },
  premium: {
    code: { limit: 100, windowSeconds: HOUR_SECONDS },
    fileGeneration: { limit: 100, windowSeconds: DAY_SECONDS },
    mcp: { limit: 500, windowSeconds: DAY_SECONDS },
    messages: { limit: 100, windowSeconds: HOUR_SECONDS },
    research: { limit: 100, windowSeconds: MONTH_SECONDS },
    uploads: { limit: 200, windowSeconds: DAY_SECONDS },
    webSearch: { limit: 1000, windowSeconds: DAY_SECONDS },
  },
};

let redisClient: RedisClientType | null = null;
let redisConnectPromise: Promise<RedisClientType> | null = null;

async function getRedisClient() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (redisClient?.isReady) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    const client = createClient({ url: redisUrl });
    client.on("error", (error) => {
      console.error("Quota Redis error", error);
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

function getWindowBucket(windowSeconds: number) {
  return Math.floor(Date.now() / (windowSeconds * 1000));
}

export async function getPlanForUser(userId: string): Promise<Plan> {
  const entitlement = await getUserEntitlement(userId);
  return entitlement.plan;
}

export async function consumeQuota({
  cost = 1,
  resource,
  userId,
}: {
  cost?: number;
  resource: QuotaResource;
  userId: string;
}) {
  const plan = await getPlanForUser(userId);

  if (plan === "owner") {
    return {
      allowed: true as const,
      limit: null,
      plan,
      remaining: null,
      resetAt: null,
    };
  }

  const rule = PLAN_QUOTAS[plan][resource];
  const redis = await getRedisClient();

  if (!redis) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Quota backend is unavailable: REDIS_URL is not configured");
    }

    return {
      allowed: true as const,
      limit: rule.limit,
      plan,
      remaining: rule.limit,
      resetAt: null,
    };
  }

  const bucket = getWindowBucket(rule.windowSeconds);
  const key = `quota:${resource}:${userId}:${bucket}`;
  const current = await redis.incrBy(key, cost);

  if (current === cost) {
    await redis.expire(key, rule.windowSeconds + 60);
  }

  const remaining = Math.max(0, rule.limit - current);
  const resetAt = new Date((bucket + 1) * rule.windowSeconds * 1000);

  return {
    allowed: current <= rule.limit,
    limit: rule.limit,
    plan,
    remaining,
    resetAt,
  };
}

export async function getQuotaSnapshot(userId: string) {
  const plan = await getPlanForUser(userId);
  if (plan === "owner") {
    return {
      limits: null,
      plan,
    };
  }

  return {
    limits: PLAN_QUOTAS[plan],
    plan,
  };
}
