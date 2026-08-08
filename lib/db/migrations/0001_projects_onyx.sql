CREATE TABLE IF NOT EXISTS "OnyxIdentity" (
  "userId" uuid PRIMARY KEY NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "onyxUserId" uuid NOT NULL,
  "apiKeyId" integer NOT NULL,
  "encryptedCredential" text NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "OnyxIdentity_onyxUserId_unique"
  ON "OnyxIdentity" ("onyxUserId");

CREATE TABLE IF NOT EXISTS "Project" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "instructions" text,
  "onyxProjectId" integer NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Project_userId_onyxProjectId_unique"
  ON "Project" ("userId", "onyxProjectId");
