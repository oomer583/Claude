import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { provisionOnyxCredential } from "@/lib/integrations/onyx/identity";
import { createOnyxProject } from "@/lib/integrations/onyx/projects";
import { decryptSecret, encryptSecret } from "@/lib/security/encryption";
import { onyxIdentity, project } from "./schema";

const client = postgres(process.env.POSTGRES_URL ?? "");
const db = drizzle(client);

export async function getOrCreateOnyxCredential(userId: string) {
  const [existing] = await db
    .select()
    .from(onyxIdentity)
    .where(eq(onyxIdentity.userId, userId))
    .limit(1);

  if (existing) {
    return {
      bearerToken: decryptSecret(existing.encryptedCredential),
      onyxUserId: existing.onyxUserId,
    };
  }

  const credential = await provisionOnyxCredential(userId);

  await db.insert(onyxIdentity).values({
    apiKeyId: credential.apiKeyId,
    encryptedCredential: encryptSecret(credential.bearerToken),
    onyxUserId: credential.onyxUserId,
    userId,
  });

  return {
    bearerToken: credential.bearerToken,
    onyxUserId: credential.onyxUserId,
  };
}

export function listProjectsByUserId(userId: string) {
  return db
    .select()
    .from(project)
    .where(eq(project.userId, userId))
    .orderBy(desc(project.createdAt));
}

export async function getProjectByIdForUser({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const [result] = await db
    .select()
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, userId)))
    .limit(1);

  return result;
}

export async function createProjectForUser({
  instructions,
  name,
  userId,
}: {
  instructions?: string | null;
  name: string;
  userId: string;
}) {
  const credential = await getOrCreateOnyxCredential(userId);
  const onyxProject = await createOnyxProject({
    bearerToken: credential.bearerToken,
    name,
  });

  const [created] = await db
    .insert(project)
    .values({
      instructions: instructions?.trim() || null,
      name,
      onyxProjectId: onyxProject.id,
      userId,
    })
    .returning();

  return created;
}
