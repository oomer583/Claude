import "server-only";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hashPromoCode, isOwnerPromoCode } from "@/lib/security/promo-code";
import { promoRedemption, userEntitlement } from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function redeemOwnerPromo({
  code,
  userId,
}: {
  code: string;
  userId: string;
}) {
  if (!isOwnerPromoCode(code)) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const codeHash = hashPromoCode(code);

  await db.transaction(async (tx) => {
    await tx
      .insert(promoRedemption)
      .values({ codeHash, userId })
      .onConflictDoNothing();

    await tx
      .insert(userEntitlement)
      .values({
        expiresAt: null,
        plan: "owner",
        source: "promo",
        userId,
      })
      .onConflictDoUpdate({
        set: {
          expiresAt: null,
          plan: "owner",
          source: "promo",
          updatedAt: new Date(),
        },
        target: userEntitlement.userId,
      });
  });

  return { ok: true as const, plan: "owner" as const };
}

export async function getUserEntitlement(userId: string) {
  const [entitlement] = await db
    .select()
    .from(userEntitlement)
    .where(eq(userEntitlement.userId, userId))
    .limit(1);

  if (!entitlement) {
    return { plan: "free" as const, source: "default" as const };
  }

  if (entitlement.expiresAt && entitlement.expiresAt <= new Date()) {
    return { plan: "free" as const, source: "default" as const };
  }

  return entitlement;
}
