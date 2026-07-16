CREATE TYPE "public"."age_group_code" AS ENUM('2-3', '4-5', '6-8');--> statement-breakpoint
CREATE TYPE "public"."child_status" AS ENUM('active', 'pending_deletion', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'in_review', 'rejected', 'approved', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."data_request_type" AS ENUM('export', 'delete');--> statement-breakpoint
CREATE TYPE "public"."media_safety_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'audio');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('mission_completed', 'suggestion_available', 'thinking_habit', 'system');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single_choice', 'pattern_sequence', 'drag_drop', 'fill_answer', 'sorting');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."review_action" AS ENUM('created', 'updated', 'duplicated', 'submitted', 'approved', 'rejected', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."mission_session_status" AS ENUM('in_progress', 'completed', 'exited');--> statement-breakpoint
CREATE TYPE "public"."world_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" text DEFAULT 'parent' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_profile_id" uuid NOT NULL,
	"date" date NOT NULL,
	"missions_completed" integer DEFAULT 0 NOT NULL,
	"questions_completed" integer DEFAULT 0 NOT NULL,
	"minutes_played" integer DEFAULT 0 NOT NULL,
	"skill_stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"hint_used_count" integer DEFAULT 0 NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_child_date_unique" UNIQUE("child_profile_id","date")
);
--> statement-breakpoint
CREATE TABLE "age_groups" (
	"code" "age_group_code" PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"user_id" text,
	"child_profile_id" uuid,
	"mission_id" uuid,
	"session_id" uuid,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" text,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"before_state" jsonb,
	"after_state" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon_asset_id" uuid,
	"icon_url" text NOT NULL,
	"skill_id" uuid,
	"unlock_rule" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "child_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_profile_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"source_mission_id" uuid,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "child_badge_unique" UNIQUE("child_profile_id","badge_id")
);
--> statement-breakpoint
CREATE TABLE "child_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_profile_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"age_group" "age_group_code" NOT NULL,
	"avatar_url" text NOT NULL,
	"mascot_id" text DEFAULT 'bong' NOT NULL,
	"current_rank" text DEFAULT 'Nhà thám hiểm nhí' NOT NULL,
	"status" "child_status" DEFAULT 'active' NOT NULL,
	"deletion_requested_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "child_display_name_length" CHECK (char_length("child_profiles"."display_name") between 1 and 20)
);
--> statement-breakpoint
CREATE TABLE "conversation_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"question_text" text NOT NULL,
	"purpose" text NOT NULL,
	"age_group" "age_group_code",
	"related_mission_id" uuid,
	"skill_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_profile_id" uuid NOT NULL,
	"type" "data_request_type" NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"download_url" text,
	"expires_at" timestamp with time zone,
	"error" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"text" text NOT NULL,
	"asset_id" uuid,
	CONSTRAINT "hints_question_level_unique" UNIQUE("question_id","level"),
	CONSTRAINT "hints_level_range" CHECK ("hints"."level" between 1 and 3)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "media_type" NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"alt_text" text NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" text,
	"safety_status" "media_safety_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "media_assets_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "mission_age_groups" (
	"mission_id" uuid NOT NULL,
	"age_group" "age_group_code" NOT NULL,
	CONSTRAINT "mission_age_groups_mission_id_age_group_pk" PRIMARY KEY("mission_id","age_group")
);
--> statement-breakpoint
CREATE TABLE "mission_secondary_skills" (
	"mission_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "mission_secondary_skills_mission_id_skill_id_pk" PRIMARY KEY("mission_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "mission_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_profile_id" uuid NOT NULL,
	"mission_id" uuid NOT NULL,
	"mission_version_id" uuid NOT NULL,
	"status" "mission_session_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"wrong_attempt_count" integer DEFAULT 0 NOT NULL,
	"hint_used_count" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"status" "content_status" NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by" text,
	"reviewed_by" text,
	"review_comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	CONSTRAINT "mission_versions_number_unique" UNIQUE("mission_id","version_number")
);
--> statement-breakpoint
CREATE TABLE "mission_worlds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer NOT NULL,
	"theme_color" text NOT NULL,
	"icon_asset_id" uuid,
	"cover_asset_id" uuid,
	"cover_url" text NOT NULL,
	"status" "world_status" DEFAULT 'draft' NOT NULL,
	"unlock_rule" jsonb DEFAULT '{"type":"always"}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mission_worlds_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"short_description" text NOT NULL,
	"story_intro" text NOT NULL,
	"estimated_minutes" integer NOT NULL,
	"primary_skill_id" uuid NOT NULL,
	"reward_badge_id" uuid,
	"cover_asset_id" uuid,
	"cover_url" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"allow_replay" boolean DEFAULT true NOT NULL,
	"randomize_answers" boolean DEFAULT false NOT NULL,
	"unlock_rule" jsonb DEFAULT '{"type":"world_order"}'::jsonb NOT NULL,
	"current_draft_version" integer DEFAULT 1 NOT NULL,
	"published_version_id" uuid,
	"created_by" text,
	"updated_by" text,
	"published_at" timestamp with time zone,
	"scheduled_for" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "missions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_profile_id" uuid NOT NULL,
	"child_profile_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parent_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"pin_hash" text,
	"pin_failed_attempts" integer DEFAULT 0 NOT NULL,
	"pin_locked_until" timestamp with time zone,
	"sound_enabled" boolean DEFAULT true NOT NULL,
	"effects_enabled" boolean DEFAULT true NOT NULL,
	"notification_settings" jsonb DEFAULT '{"missionCompleted":true,"suggestions":true,"weeklySummary":true}'::jsonb NOT NULL,
	"privacy_settings" jsonb DEFAULT '{"analytics":true}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parent_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "parent_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"age_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover_asset_id" uuid,
	"cover_url" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parent_resources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "question_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_answer" jsonb NOT NULL,
	"is_correct" boolean NOT NULL,
	"attempt_number" integer NOT NULL,
	"hints_used" integer DEFAULT 0 NOT NULL,
	"response_time_ms" integer NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_attempts_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "question_skills" (
	"question_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "question_skills_question_id_skill_id_pk" PRIMARY KEY("question_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"type" "question_type" NOT NULL,
	"prompt" text NOT NULL,
	"instruction" text NOT NULL,
	"payload" jsonb NOT NULL,
	"correct_answer" jsonb NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"feedback_correct" text NOT NULL,
	"feedback_incorrect" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_mission_order_unique" UNIQUE("mission_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "review_histories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"mission_version_id" uuid,
	"action" "review_action" NOT NULL,
	"actor_id" text,
	"comment" text,
	"before_state" jsonb,
	"after_state" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_checklist_entries" (
	"mission_id" uuid NOT NULL,
	"key" text NOT NULL,
	"passed" boolean DEFAULT false NOT NULL,
	"note" text,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "safety_checklist_entries_mission_id_key_pk" PRIMARY KEY("mission_id","key")
);
--> statement-breakpoint
CREATE TABLE "session_question_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"hint_level" integer DEFAULT 0 NOT NULL,
	"first_viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "session_question_unique" UNIQUE("session_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_age_groups" (
	"world_id" uuid NOT NULL,
	"age_group" "age_group_code" NOT NULL,
	CONSTRAINT "world_age_groups_world_id_age_group_pk" PRIMARY KEY("world_id","age_group")
);
--> statement-breakpoint
CREATE TABLE "world_skills" (
	"world_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "world_skills_world_id_skill_id_pk" PRIMARY KEY("world_id","skill_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_summaries" ADD CONSTRAINT "activity_summaries_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_session_id_mission_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."mission_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_icon_asset_id_media_assets_id_fk" FOREIGN KEY ("icon_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_badges" ADD CONSTRAINT "child_badges_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_badges" ADD CONSTRAINT "child_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_badges" ADD CONSTRAINT "child_badges_source_mission_id_missions_id_fk" FOREIGN KEY ("source_mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_parent_profile_id_parent_profiles_id_fk" FOREIGN KEY ("parent_profile_id") REFERENCES "public"."parent_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_suggestions" ADD CONSTRAINT "conversation_suggestions_related_mission_id_missions_id_fk" FOREIGN KEY ("related_mission_id") REFERENCES "public"."missions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_suggestions" ADD CONSTRAINT "conversation_suggestions_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_requests" ADD CONSTRAINT "data_requests_parent_profile_id_parent_profiles_id_fk" FOREIGN KEY ("parent_profile_id") REFERENCES "public"."parent_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_age_groups" ADD CONSTRAINT "mission_age_groups_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_secondary_skills" ADD CONSTRAINT "mission_secondary_skills_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_secondary_skills" ADD CONSTRAINT "mission_secondary_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_sessions" ADD CONSTRAINT "mission_sessions_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_sessions" ADD CONSTRAINT "mission_sessions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_sessions" ADD CONSTRAINT "mission_sessions_mission_version_id_mission_versions_id_fk" FOREIGN KEY ("mission_version_id") REFERENCES "public"."mission_versions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_versions" ADD CONSTRAINT "mission_versions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_versions" ADD CONSTRAINT "mission_versions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_versions" ADD CONSTRAINT "mission_versions_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_worlds" ADD CONSTRAINT "mission_worlds_icon_asset_id_media_assets_id_fk" FOREIGN KEY ("icon_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_worlds" ADD CONSTRAINT "mission_worlds_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_world_id_mission_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."mission_worlds"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_primary_skill_id_skills_id_fk" FOREIGN KEY ("primary_skill_id") REFERENCES "public"."skills"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_reward_badge_id_badges_id_fk" FOREIGN KEY ("reward_badge_id") REFERENCES "public"."badges"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_parent_profile_id_parent_profiles_id_fk" FOREIGN KEY ("parent_profile_id") REFERENCES "public"."parent_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_child_profile_id_child_profiles_id_fk" FOREIGN KEY ("child_profile_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_profiles" ADD CONSTRAINT "parent_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_resources" ADD CONSTRAINT "parent_resources_cover_asset_id_media_assets_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_resources" ADD CONSTRAINT "parent_resources_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_session_id_mission_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."mission_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_attempts" ADD CONSTRAINT "question_attempts_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_skills" ADD CONSTRAINT "question_skills_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_skills" ADD CONSTRAINT "question_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_histories" ADD CONSTRAINT "review_histories_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_histories" ADD CONSTRAINT "review_histories_mission_version_id_mission_versions_id_fk" FOREIGN KEY ("mission_version_id") REFERENCES "public"."mission_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_histories" ADD CONSTRAINT "review_histories_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_checklist_entries" ADD CONSTRAINT "safety_checklist_entries_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_checklist_entries" ADD CONSTRAINT "safety_checklist_entries_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_states" ADD CONSTRAINT "session_question_states_session_id_mission_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."mission_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_states" ADD CONSTRAINT "session_question_states_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_age_groups" ADD CONSTRAINT "world_age_groups_world_id_mission_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."mission_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_skills" ADD CONSTRAINT "world_skills_world_id_mission_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."mission_worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_skills" ADD CONSTRAINT "world_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "analytics_event_created_idx" ON "analytics_events" USING btree ("event_name","created_at");--> statement-breakpoint
CREATE INDEX "audit_resource_created_idx" ON "audit_logs" USING btree ("resource_type","created_at");--> statement-breakpoint
CREATE INDEX "child_profiles_parent_idx" ON "child_profiles" USING btree ("parent_profile_id");--> statement-breakpoint
CREATE INDEX "mission_sessions_child_status_idx" ON "mission_sessions" USING btree ("child_profile_id","status");--> statement-breakpoint
CREATE INDEX "missions_world_status_idx" ON "missions" USING btree ("world_id","status");