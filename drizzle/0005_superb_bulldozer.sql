CREATE TYPE "public"."content_value_type" AS ENUM('text', 'number', 'boolean', 'json');--> statement-breakpoint
CREATE TYPE "public"."parent_resource_type" AS ENUM('article', 'guide', 'activity', 'video');--> statement-breakpoint
ALTER TABLE "questions" DROP CONSTRAINT "questions_mission_order_unique";--> statement-breakpoint
ALTER TABLE "content_entries" ADD COLUMN "category" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_entries" ADD COLUMN "value_type" "content_value_type" DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "category" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "parent_resources" ADD COLUMN "resource_type" "parent_resource_type" DEFAULT 'article' NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD COLUMN "retired_at" timestamp with time zone;--> statement-breakpoint
UPDATE "content_entries"
SET "category" = CASE
  WHEN position('.' in "key") > 0 THEN split_part("key", '.', 1)
  ELSE 'general'
END,
"value_type" = CASE jsonb_typeof("value")
  WHEN 'number' THEN 'number'::"content_value_type"
  WHEN 'boolean' THEN 'boolean'::"content_value_type"
  WHEN 'array' THEN 'json'::"content_value_type"
  WHEN 'object' THEN 'json'::"content_value_type"
  ELSE 'text'::"content_value_type"
END;--> statement-breakpoint
UPDATE "parent_resources"
SET "resource_type" = 'guide'::"parent_resource_type",
"category" = CASE "category"
  WHEN 'Đồng hành' THEN 'companionship'
  WHEN 'Trò chuyện' THEN 'conversation'
  WHEN 'An toàn cảm xúc' THEN 'emotional-safety'
  ELSE "category"
END;--> statement-breakpoint
CREATE INDEX "content_entry_filter_idx" ON "content_entries" USING btree ("namespace","category","value_type","active");--> statement-breakpoint
CREATE INDEX "media_assets_filter_idx" ON "media_assets" USING btree ("type","category","safety_status","created_at");--> statement-breakpoint
CREATE INDEX "parent_resources_filter_idx" ON "parent_resources" USING btree ("status","resource_type","category","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "questions_mission_order_active_unique" ON "questions" USING btree ("mission_id","sort_order") WHERE "questions"."retired_at" is null;
