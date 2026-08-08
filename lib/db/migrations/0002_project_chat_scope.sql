ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "projectId" uuid;
ALTER TABLE "Chat" ADD COLUMN IF NOT EXISTS "onyxChatSessionId" uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Chat_projectId_Project_id_fk'
  ) THEN
    ALTER TABLE "Chat"
      ADD CONSTRAINT "Chat_projectId_Project_id_fk"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Chat_projectId_idx" ON "Chat" ("projectId");
