import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { userStyle } from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export function listUserStyles(userId: string) {
  return db
    .select()
    .from(userStyle)
    .where(eq(userStyle.userId, userId))
    .orderBy(desc(userStyle.isActive), desc(userStyle.updatedAt));
}

export async function getActiveUserStyle(userId: string) {
  const [style] = await db
    .select()
    .from(userStyle)
    .where(and(eq(userStyle.userId, userId), eq(userStyle.isActive, true)))
    .limit(1);
  return style ?? null;
}

export async function createUserStyle({
  instructions,
  name,
  userId,
}: {
  instructions: string;
  name: string;
  userId: string;
}) {
  const existing = await listUserStyles(userId);
  const shouldActivate = existing.length === 0;
  const [created] = await db
    .insert(userStyle)
    .values({
      instructions,
      isActive: shouldActivate,
      name,
      userId,
    })
    .returning();
  return created;
}

export async function activateUserStyle({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ id: userStyle.id })
      .from(userStyle)
      .where(and(eq(userStyle.id, id), eq(userStyle.userId, userId)))
      .limit(1);
    if (!owned) {
      return null;
    }

    await tx
      .update(userStyle)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(userStyle.userId, userId));

    const [activated] = await tx
      .update(userStyle)
      .set({ isActive: true, updatedAt: new Date() })
      .where(and(eq(userStyle.id, id), eq(userStyle.userId, userId)))
      .returning();

    return activated ?? null;
  });
}

export async function deleteUserStyle({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  return db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(userStyle)
      .where(and(eq(userStyle.id, id), eq(userStyle.userId, userId)))
      .returning();

    if (!deleted) {
      return null;
    }

    if (deleted.isActive) {
      const [replacement] = await tx
        .select()
        .from(userStyle)
        .where(eq(userStyle.userId, userId))
        .orderBy(desc(userStyle.updatedAt))
        .limit(1);
      if (replacement) {
        await tx
          .update(userStyle)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(userStyle.id, replacement.id));
      }
    }

    return deleted;
  });
}
