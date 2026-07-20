CREATE TYPE "public"."storage_provider" AS ENUM('local', 's3', 'cloudinary');--> statement-breakpoint
ALTER TYPE "public"."media_type" ADD VALUE 'video';--> statement-breakpoint
ALTER TABLE "media_assets" DROP CONSTRAINT "media_assets_storage_key_unique";--> statement-breakpoint
ALTER TABLE "age_groups" ALTER COLUMN "code" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "child_profiles" ALTER COLUMN "age_group" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "conversation_suggestions" ALTER COLUMN "age_group" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "mission_age_groups" ALTER COLUMN "age_group" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "world_age_groups" ALTER COLUMN "age_group" SET DATA TYPE text;--> statement-breakpoint
UPDATE "child_profiles" SET "age_group" = '6-8' WHERE "age_group" IN ('2-3', '4-5');--> statement-breakpoint
UPDATE "conversation_suggestions" SET "age_group" = '6-8' WHERE "age_group" IN ('2-3', '4-5');--> statement-breakpoint
INSERT INTO "mission_age_groups" ("mission_id", "age_group") SELECT DISTINCT "mission_id", '6-8' FROM "mission_age_groups" WHERE "age_group" IN ('2-3', '4-5') ON CONFLICT DO NOTHING;--> statement-breakpoint
DELETE FROM "mission_age_groups" WHERE "age_group" IN ('2-3', '4-5');--> statement-breakpoint
INSERT INTO "world_age_groups" ("world_id", "age_group") SELECT DISTINCT "world_id", '6-8' FROM "world_age_groups" WHERE "age_group" IN ('2-3', '4-5') ON CONFLICT DO NOTHING;--> statement-breakpoint
DELETE FROM "world_age_groups" WHERE "age_group" IN ('2-3', '4-5');--> statement-breakpoint
DELETE FROM "age_groups" WHERE "code" IN ('2-3', '4-5');--> statement-breakpoint
UPDATE "age_groups" SET "label" = '6–8 tuổi', "description" = 'Quan sát, quy luật, phân loại và suy luận trực quan.', "min_age" = 6, "max_age" = 8, "sort_order" = 1 WHERE "code" = '6-8';--> statement-breakpoint
UPDATE "parent_resources" SET "age_groups" = (SELECT COALESCE(jsonb_agg("mapped" ORDER BY "mapped"), '[]'::jsonb) FROM (SELECT DISTINCT CASE WHEN value IN ('2-3', '4-5') THEN '6-8' ELSE value END AS "mapped" FROM jsonb_array_elements_text("parent_resources"."age_groups")) AS normalized);--> statement-breakpoint
DROP TYPE "public"."age_group_code";--> statement-breakpoint
CREATE TYPE "public"."age_group_code" AS ENUM('6-8', '9-10', '11-12');--> statement-breakpoint
ALTER TABLE "age_groups" ALTER COLUMN "code" SET DATA TYPE "public"."age_group_code" USING "code"::"public"."age_group_code";--> statement-breakpoint
ALTER TABLE "child_profiles" ALTER COLUMN "age_group" SET DATA TYPE "public"."age_group_code" USING "age_group"::"public"."age_group_code";--> statement-breakpoint
ALTER TABLE "conversation_suggestions" ALTER COLUMN "age_group" SET DATA TYPE "public"."age_group_code" USING "age_group"::"public"."age_group_code";--> statement-breakpoint
ALTER TABLE "mission_age_groups" ALTER COLUMN "age_group" SET DATA TYPE "public"."age_group_code" USING "age_group"::"public"."age_group_code";--> statement-breakpoint
ALTER TABLE "world_age_groups" ALTER COLUMN "age_group" SET DATA TYPE "public"."age_group_code" USING "age_group"::"public"."age_group_code";--> statement-breakpoint
INSERT INTO "age_groups" ("code", "label", "description", "min_age", "max_age", "sort_order", "active") VALUES ('9-10', '9–10 tuổi', 'Suy luận nhiều bước, nguyên nhân – kết quả và chiến lược giải quyết vấn đề.', 9, 10, 2, true), ('11-12', '11–12 tuổi', 'Logic nâng cao, kiểm chứng giả thuyết và giải quyết tình huống phức hợp.', 11, 12, 3, true) ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "storage_provider" "storage_provider" DEFAULT 'local' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "storage_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_provider_key_unique" ON "media_assets" USING btree ("storage_provider","storage_key");