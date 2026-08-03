import postgres from "@fastify/postgres";
import Fastify, { type FastifyInstance } from "fastify";

import type { HealthResponse } from "@ai-workspace/shared";

export interface AppOptions {
  databaseUrl?: string;
  logger?: boolean;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const logger = options.logger ?? { level: process.env.LOG_LEVEL ?? "info" };
  const app = Fastify({ logger });
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;

  if (databaseUrl) {
    void app.register(postgres, { connectionString: databaseUrl });
  }

  app.get("/health", async (): Promise<HealthResponse> => ({
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0"
  }));

  return app;
}
