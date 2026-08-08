import "server-only";

import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chat, message } from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export function searchUserChats({
  query,
  userId,
}: {
  query: string;
  userId: string;
}) {
  const pattern = `%${query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;

  return db
    .select({
      createdAt: chat.createdAt,
      id: chat.id,
      projectId: chat.projectId,
      title: chat.title,
    })
    .from(chat)
    .where(
      and(
        eq(chat.userId, userId),
        or(
          ilike(chat.title, pattern),
          sql`exists (
            select 1
            from ${message}
            where ${message.chatId} = ${chat.id}
              and cast(${message.parts} as text) ilike ${pattern} escape '\\'
          )`
        )
      )
    )
    .orderBy(desc(chat.createdAt))
    .limit(30);
}
