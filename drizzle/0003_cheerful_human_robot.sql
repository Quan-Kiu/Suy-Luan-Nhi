CREATE TABLE "content_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"namespace" text NOT NULL,
	"key" text NOT NULL,
	"locale" text DEFAULT 'vi' NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_entries" ADD CONSTRAINT "content_entries_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_entry_namespace_key_locale_idx" ON "content_entries" USING btree ("namespace","key","locale");--> statement-breakpoint
CREATE INDEX "content_entry_namespace_idx" ON "content_entries" USING btree ("namespace","locale","active");