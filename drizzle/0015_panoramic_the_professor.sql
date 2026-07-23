CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"failed_verification_count" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "two_factor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "two_factor_user_id_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION prevent_banned_user_session() RETURNS trigger AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sln:user-session:' || NEW.user_id));
  IF EXISTS (
    SELECT 1
    FROM "user"
    WHERE id = NEW.user_id
      AND banned = true
      AND (ban_expires IS NULL OR ban_expires > now())
  ) THEN
    RAISE EXCEPTION 'ACCOUNT_BANNED' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER prevent_banned_user_session_trigger
BEFORE INSERT OR UPDATE OF user_id ON "session"
FOR EACH ROW EXECUTE FUNCTION prevent_banned_user_session();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION protect_last_super_admin() RETURNS trigger AS $$
DECLARE
  removes_active_super_admin boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('sln:member-policy'));
  IF TG_OP = 'DELETE' THEN
    PERFORM pg_advisory_xact_lock(hashtext('sln:user-session:' || OLD.id));
  ELSE
    PERFORM pg_advisory_xact_lock(hashtext('sln:user-session:' || NEW.id));
  END IF;
  IF TG_OP = 'DELETE' THEN
    removes_active_super_admin := OLD.role = 'super_admin' AND OLD.banned = false;
  ELSE
    removes_active_super_admin := OLD.role = 'super_admin'
      AND OLD.banned = false
      AND (NEW.role <> 'super_admin' OR NEW.banned = true);
  END IF;
  IF removes_active_super_admin AND NOT EXISTS (
    SELECT 1 FROM "user"
    WHERE id <> OLD.id AND role = 'super_admin' AND banned = false
  ) THEN
    RAISE EXCEPTION 'LAST_SUPER_ADMIN' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER protect_last_super_admin_update_trigger
BEFORE UPDATE OF role, banned ON "user"
FOR EACH ROW EXECUTE FUNCTION protect_last_super_admin();
--> statement-breakpoint
CREATE TRIGGER protect_last_super_admin_delete_trigger
BEFORE DELETE ON "user"
FOR EACH ROW EXECUTE FUNCTION protect_last_super_admin();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION revoke_sessions_on_active_ban() RETURNS trigger AS $$
DECLARE
  old_ban_active boolean;
  new_ban_active boolean;
BEGIN
  old_ban_active := OLD.banned = true AND (OLD.ban_expires IS NULL OR OLD.ban_expires > now());
  new_ban_active := NEW.banned = true AND (NEW.ban_expires IS NULL OR NEW.ban_expires > now());
  IF new_ban_active AND NOT old_ban_active THEN
    DELETE FROM "session" WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER revoke_sessions_on_active_ban_trigger
AFTER UPDATE OF banned, ban_expires ON "user"
FOR EACH ROW EXECUTE FUNCTION revoke_sessions_on_active_ban();
