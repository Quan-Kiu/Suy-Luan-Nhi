CREATE TABLE "access_roles" (
  "key" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "access_role_key" text;
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_access_role_key_access_roles_key_fk"
  FOREIGN KEY ("access_role_key") REFERENCES "public"."access_roles"("key")
  ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "user_access_role_key_idx" ON "user" USING btree ("access_role_key");
