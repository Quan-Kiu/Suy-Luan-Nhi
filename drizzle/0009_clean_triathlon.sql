CREATE TYPE "public"."system_feedback_status" AS ENUM('new', 'in_progress', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "system_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"content" text NOT NULL,
	"page_path" text NOT NULL,
	"page_title" text,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "system_feedback_status" DEFAULT 'new' NOT NULL,
	"admin_note" text,
	"handled_by" text,
	"handled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "system_feedback_content_length" CHECK (char_length("system_feedback"."content") between 10 and 4000)
);
--> statement-breakpoint
CREATE TABLE "system_feedback_attachments" (
	"feedback_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "system_feedback_attachments_feedback_id_media_asset_id_pk" PRIMARY KEY("feedback_id","media_asset_id"),
	CONSTRAINT "system_feedback_attachment_order_unique" UNIQUE("feedback_id","sort_order")
);
--> statement-breakpoint
ALTER TABLE "system_feedback" ADD CONSTRAINT "system_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_feedback" ADD CONSTRAINT "system_feedback_handled_by_user_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_feedback_attachments" ADD CONSTRAINT "system_feedback_attachments_feedback_id_system_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."system_feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_feedback_attachments" ADD CONSTRAINT "system_feedback_attachments_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "system_feedback_status_created_idx" ON "system_feedback" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "system_feedback_user_created_idx" ON "system_feedback" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "system_feedback_attachment_media_idx" ON "system_feedback_attachments" USING btree ("media_asset_id");