ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "deleted_previous_ban_expires" timestamp with time zone;
