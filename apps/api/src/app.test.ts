import assert from "node:assert/strict";
import test from "node:test";

import type { HealthResponse } from "@ai-workspace/shared";

import { buildApp } from "./app.js";

test("GET /health reports the API status", async () => {
  const app = buildApp({ logger: false });

  const response = await app.inject({ method: "GET", url: "/health" });
  const payload = response.json<HealthResponse>();

  assert.equal(response.statusCode, 200);
  assert.equal(payload.service, "api");
  assert.equal(payload.status, "ok");
  assert.equal(Number.isNaN(Date.parse(payload.timestamp)), false);

  await app.close();
});
