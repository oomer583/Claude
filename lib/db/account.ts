import "server-only";

import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  chat,
  document,
  message,
  onyxIdentity,
  project,
  promoRedemption,
  stream,
  suggestion,
  user,
  userEntitlement,
  vote,
} from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function exportAccountData(userId: string) {
  const [account] = await db.select().from(user).where(eq(user.id, userId));
  if (!account) {
    return null;
  }

  const [entitlement, projects, chats, documents, redemptions, identity] =
    await Promise.all([
      db
        .select()
        .from(userEntitlement)
        .where(eq(userEntitlement.userId, userId))
        .then((rows) => rows[0] ?? null),
      db.select().from(project).where(eq(project.userId, userId)),
      db.select().from(chat).where(eq(chat.userId, userId)),
      db.select().from(document).where(eq(document.userId, userId)),
      db
        .select({ redeemedAt: promoRedemption.redeemedAt })
        .from(promoRedemption)
        .where(eq(promoRedemption.userId, userId)),
      db
        .select({
          createdAt: onyxIdentity.createdAt,
          onyxUserId: onyxIdentity.onyxUserId,
        })
        .from(onyxIdentity)
        .where(eq(onyxIdentity.userId, userId))
        .then((rows) => rows[0] ?? null),
    ]);

  const chatIds = chats.map((item) => item.id);
  const [messages, suggestions] = await Promise.all([
    chatIds.length > 0
      ? db.select().from(message).where(inArray(message.chatId, chatIds))
      : Promise.resolve([]),
    db.select().from(suggestion).where(eq(suggestion.userId, userId)),
  ]);

  return {
    account: {
      createdAt: account.createdAt,
      email: account.email,
      emailVerified: account.emailVerified,
      id: account.id,
      image: account.image,
      isAnonymous: account.isAnonymous,
      name: account.name,
      updatedAt: account.updatedAt,
    },
    chats,
    documents,
    entitlement,
    exportedAt: new Date().toISOString(),
    messages,
    onyxIdentity: identity,
    projects,
    promoRedemptions: redemptions,
    suggestions,
  };
}

export async function getOnyxIdentityForDeletion(userId: string) {
  const rows = await db
    .select({ apiKeyId: onyxIdentity.apiKeyId })
    .from(onyxIdentity)
    .where(eq(onyxIdentity.userId, userId));
  return rows[0] ?? null;
}

export function deleteAccountData(userId: string) {
  return db.transaction(async (tx) => {
    const userChats = await tx
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));
    const chatIds = userChats.map((item) => item.id);

    if (chatIds.length > 0) {
      await tx.delete(vote).where(inArray(vote.chatId, chatIds));
      await tx.delete(message).where(inArray(message.chatId, chatIds));
      await tx.delete(stream).where(inArray(stream.chatId, chatIds));
      await tx.delete(chat).where(inArray(chat.id, chatIds));
    }

    await tx.delete(suggestion).where(eq(suggestion.userId, userId));
    await tx.delete(document).where(eq(document.userId, userId));
    await tx.delete(project).where(eq(project.userId, userId));
    await tx.delete(promoRedemption).where(eq(promoRedemption.userId, userId));
    await tx.delete(userEntitlement).where(eq(userEntitlement.userId, userId));
    await tx.delete(onyxIdentity).where(eq(onyxIdentity.userId, userId));

    const deleted = await tx
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    return deleted.length === 1;
  });
}
