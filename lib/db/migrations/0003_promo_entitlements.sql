CREATE TABLE IF NOT EXISTS "UserEntitlement" (
  "userId" uuid PRIMARY KEY NOT NULL,
  "plan" varchar DEFAULT 'free' NOT NULL,
  "source" varchar DEFAULT 'default' NOT NULL,
  "expiresAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "PromoRedemption" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" uuid NOT NULL,
  "codeHash" varchar(64) NOT NULL,
  "redeemedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserEntitlement" ADD CONSTRAINT "UserEntitlement_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PromoRedemption" ADD CONSTRAINT "PromoRedemption_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "PromoRedemption_userId_codeHash_unique" ON "PromoRedemption" USING btree ("userId","codeHash");
