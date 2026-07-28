ALTER TABLE "child_profiles" DROP CONSTRAINT "child_display_name_length";--> statement-breakpoint
ALTER TABLE "parent_resources" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_display_name_length" CHECK (char_length("child_profiles"."display_name") between 2 and 20) NOT VALID;