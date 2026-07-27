ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_by" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deletion_reason" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_previous_banned" boolean;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_previous_ban_reason" text;
