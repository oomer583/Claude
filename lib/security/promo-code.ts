import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

function normalizePromoCode(value: string) {
  return value.trim().toUpperCase();
}

export function hashPromoCode(value: string) {
  return createHash("sha256").update(normalizePromoCode(value)).digest("hex");
}

export function isOwnerPromoCode(value: string) {
  const configuredCode = process.env.OWNER_PROMO_CODE;
  if (!configuredCode) {
    return false;
  }

  const candidate = Buffer.from(hashPromoCode(value), "hex");
  const expected = Buffer.from(hashPromoCode(configuredCode), "hex");

  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
