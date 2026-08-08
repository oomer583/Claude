CREATE TABLE IF NOT EXISTS "UserStyle" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "name" varchar(80) NOT NULL,
  "instructions" text NOT NULL,
  "isActive" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "UserStyle_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX IF NOT EXISTS "UserStyle_userId_idx" ON "UserStyle" ("userId");
CREATE INDEX IF NOT EXISTS "UserStyle_userId_isActive_idx" ON "UserStyle" ("userId", "isActive");
