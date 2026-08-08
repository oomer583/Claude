import "server-only";

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chat } from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function assignChatToProject({
  chatId,
  projectId,
  userId,
}: {
  chatId: string;
  projectId: string;
  userId: string;
}) {
  const [updated] = await db
    .update(chat)
    .set({ projectId })
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    .returning();

  return updated;
}

export async function setChatOnyxSession({
  chatId,
  onyxChatSessionId,
  userId,
}: {
  chatId: string;
  onyxChatSessionId: string;
  userId: string;
}) {
  const [updated] = await db
    .update(chat)
    .set({ onyxChatSessionId })
    .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    .returning();

  return updated;
}
