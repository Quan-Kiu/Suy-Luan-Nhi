import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";
import type { ParentResourceCategory } from "@/domain/parent-resources";
import { storageProviderNames } from "@/modules/media/storage/types";
import { user } from "./auth";

export const ageGroupCode = pgEnum("age_group_code", ageGroupCodes);
export const childStatus = pgEnum("child_status", ["active", "pending_deletion", "deleted"]);
export const contentStatus = pgEnum("content_status", [
  "draft",
  "in_review",
  "rejected",
  "approved",
  "published",
  "archived",
]);
export const worldStatus = pgEnum("world_status", ["draft", "published", "archived"]);
export const questionType = pgEnum("question_type", [
  "single_choice",
  "pattern_sequence",
  "drag_drop",
  "fill_answer",
  "sorting",
]);
export const sessionStatus = pgEnum("mission_session_status", ["in_progress", "completed", "exited"]);
export const mediaType = pgEnum("media_type", ["image", "audio", "video"]);
export const parentResourceType = pgEnum("parent_resource_type", ["article", "guide", "activity", "video"]);
export const contentValueType = pgEnum("content_value_type", ["text", "number", "boolean", "json"]);
export const storageProvider = pgEnum("storage_provider", storageProviderNames);
export const mediaSafetyStatus = pgEnum("media_safety_status", ["pending", "approved", "rejected"]);
export const reviewAction = pgEnum("review_action", [
  "created",
  "updated",
  "duplicated",
  "submitted",
  "scheduled",
  "approved",
  "rejected",
  "published",
  "archived",
]);
export const dataRequestType = pgEnum("data_request_type", ["export", "delete"]);
export const requestStatus = pgEnum("request_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
]);
export const notificationType = pgEnum("notification_type", [
  "mission_completed",
  "suggestion_available",
  "thinking_habit",
  "system",
]);
export const feedbackStatus = pgEnum("system_feedback_status", [
  "new",
  "in_progress",
  "resolved",
  "dismissed",
]);

export const parentProfiles = pgTable("parent_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  pinHash: text("pin_hash"),
  pinFailedAttempts: integer("pin_failed_attempts").default(0).notNull(),
  pinLockedUntil: timestamp("pin_locked_until", { withTimezone: true }),
  soundEnabled: boolean("sound_enabled").default(true).notNull(),
  effectsEnabled: boolean("effects_enabled").default(true).notNull(),
  notificationSettings: jsonb("notification_settings")
    .$type<Record<string, boolean>>()
    .default({ missionCompleted: true, suggestions: true, weeklySummary: true })
    .notNull(),
  privacySettings: jsonb("privacy_settings")
    .$type<Record<string, boolean>>()
    .default({ analytics: true, errorReporting: false })
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const childProfiles = pgTable(
  "child_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentProfileId: uuid("parent_profile_id")
      .notNull()
      .references(() => parentProfiles.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    ageGroup: ageGroupCode("age_group").notNull(),
    avatarAssetId: uuid("avatar_asset_id").references(() => mediaAssets.id, { onDelete: "restrict" }),
    avatarUrl: text("avatar_url").notNull(),
    mascotId: text("mascot_id").default("bong").notNull(),
    currentRank: text("current_rank").default("Nhà thám hiểm nhí").notNull(),
    status: childStatus("status").default("active").notNull(),
    deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("child_profiles_parent_idx").on(table.parentProfileId),
    check("child_display_name_length", sql`char_length(${table.displayName}) between 1 and 20`),
  ],
);

export const ageGroups = pgTable("age_groups", {
  code: ageGroupCode("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull(),
  minAge: integer("min_age").notNull(),
  maxAge: integer("max_age").notNull(),
  sortOrder: integer("sort_order").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: mediaType("type").notNull(),
    storageProvider: storageProvider("storage_provider").default("local").notNull(),
    storageKey: text("storage_key").notNull(),
    storageMetadata: jsonb("storage_metadata").$type<Record<string, unknown>>().default({}).notNull(),
    category: text("category").default("general").notNull(),
    url: text("url").notNull(),
    altText: text("alt_text").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    safetyStatus: mediaSafetyStatus("safety_status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("media_assets_provider_key_unique").on(table.storageProvider, table.storageKey),
    index("media_assets_filter_idx").on(table.type, table.category, table.safetyStatus, table.createdAt),
  ],
);

export const badges = pgTable("badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconAssetId: uuid("icon_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  iconUrl: text("icon_url").notNull(),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
  unlockRule: jsonb("unlock_rule").$type<Record<string, unknown>>().notNull(),
  active: boolean("active").default(true).notNull(),
});

export const missionWorlds = pgTable("mission_worlds", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull(),
  themeColor: text("theme_color").notNull(),
  iconAssetId: uuid("icon_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  coverUrl: text("cover_url").notNull(),
  status: worldStatus("status").default("draft").notNull(),
  unlockRule: jsonb("unlock_rule").$type<Record<string, unknown>>().default({ type: "always" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const worldAgeGroups = pgTable(
  "world_age_groups",
  {
    worldId: uuid("world_id")
      .notNull()
      .references(() => missionWorlds.id, { onDelete: "cascade" }),
    ageGroup: ageGroupCode("age_group").notNull(),
  },
  (table) => [primaryKey({ columns: [table.worldId, table.ageGroup] })],
);

export const worldSkills = pgTable(
  "world_skills",
  {
    worldId: uuid("world_id")
      .notNull()
      .references(() => missionWorlds.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.worldId, table.skillId] })],
);

export const missions = pgTable(
  "missions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    worldId: uuid("world_id")
      .notNull()
      .references(() => missionWorlds.id, { onDelete: "restrict" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    shortDescription: text("short_description").notNull(),
    storyIntro: text("story_intro").notNull(),
    estimatedMinutes: integer("estimated_minutes").notNull(),
    primarySkillId: uuid("primary_skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "restrict" }),
    rewardBadgeId: uuid("reward_badge_id").references(() => badges.id, { onDelete: "set null" }),
    coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    coverUrl: text("cover_url").notNull(),
    status: contentStatus("status").default("draft").notNull(),
    difficulty: integer("difficulty").default(1).notNull(),
    allowReplay: boolean("allow_replay").default(true).notNull(),
    randomizeAnswers: boolean("randomize_answers").default(false).notNull(),
    unlockRule: jsonb("unlock_rule")
      .$type<Record<string, unknown>>()
      .default({ type: "world_order" })
      .notNull(),
    currentDraftVersion: integer("current_draft_version").default(1).notNull(),
    publishedVersionId: uuid("published_version_id"),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("missions_world_status_idx").on(table.worldId, table.status)],
);

export const missionAgeGroups = pgTable(
  "mission_age_groups",
  {
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    ageGroup: ageGroupCode("age_group").notNull(),
  },
  (table) => [primaryKey({ columns: [table.missionId, table.ageGroup] })],
);

export const missionSecondarySkills = pgTable(
  "mission_secondary_skills",
  {
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.missionId, table.skillId] })],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull(),
    type: questionType("type").notNull(),
    prompt: text("prompt").notNull(),
    instruction: text("instruction").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    correctAnswer: jsonb("correct_answer").$type<unknown>().notNull(),
    difficulty: integer("difficulty").default(1).notNull(),
    feedbackCorrect: text("feedback_correct").notNull(),
    feedbackIncorrect: text("feedback_incorrect").notNull(),
    retiredAt: timestamp("retired_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("questions_mission_order_active_unique")
      .on(table.missionId, table.sortOrder)
      .where(sql`${table.retiredAt} is null`),
  ],
);

export const questionSkills = pgTable(
  "question_skills",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.questionId, table.skillId] })],
);

export const hints = pgTable(
  "hints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    level: integer("level").notNull(),
    text: text("text").notNull(),
    assetId: uuid("asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
  },
  (table) => [
    unique("hints_question_level_unique").on(table.questionId, table.level),
    check("hints_level_range", sql`${table.level} between 1 and 3`),
  ],
);

export const missionVersions = pgTable(
  "mission_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    status: contentStatus("status").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
    reviewComment: text("review_comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [unique("mission_versions_number_unique").on(table.missionId, table.versionNumber)],
);

export const safetyChecklistEntries = pgTable(
  "safety_checklist_entries",
  {
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    passed: boolean("passed").default(false).notNull(),
    note: text("note"),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.missionId, table.key] })],
);

export const reviewHistories = pgTable("review_histories", {
  id: uuid("id").defaultRandom().primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  missionVersionId: uuid("mission_version_id").references(() => missionVersions.id, { onDelete: "set null" }),
  action: reviewAction("action").notNull(),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  comment: text("comment"),
  beforeState: jsonb("before_state").$type<unknown>(),
  afterState: jsonb("after_state").$type<unknown>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const missionSessions = pgTable(
  "mission_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    childProfileId: uuid("child_profile_id")
      .notNull()
      .references(() => childProfiles.id, { onDelete: "cascade" }),
    missionId: uuid("mission_id")
      .notNull()
      .references(() => missions.id, { onDelete: "restrict" }),
    missionVersionId: uuid("mission_version_id")
      .notNull()
      .references(() => missionVersions.id, { onDelete: "restrict" }),
    status: sessionStatus("status").default("in_progress").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    currentQuestionIndex: integer("current_question_index").default(0).notNull(),
    totalQuestions: integer("total_questions").notNull(),
    correctCount: integer("correct_count").default(0).notNull(),
    wrongAttemptCount: integer("wrong_attempt_count").default(0).notNull(),
    hintUsedCount: integer("hint_used_count").default(0).notNull(),
    stars: integer("stars").default(0).notNull(),
  },
  (table) => [
    index("mission_sessions_child_status_idx").on(table.childProfileId, table.status),
    uniqueIndex("mission_sessions_active_unique")
      .on(table.childProfileId, table.missionId, table.missionVersionId)
      .where(sql`${table.status} = 'in_progress'`),
  ],
);

export const sessionQuestionStates = pgTable(
  "session_question_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => missionSessions.id, { onDelete: "cascade" }),
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    completed: boolean("completed").default(false).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    hintLevel: integer("hint_level").default(0).notNull(),
    firstViewedAt: timestamp("first_viewed_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [unique("session_question_unique").on(table.sessionId, table.questionId)],
);

export const questionAttempts = pgTable("question_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => missionSessions.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "restrict" }),
  selectedAnswer: jsonb("selected_answer").$type<unknown>().notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  hintsUsed: integer("hints_used").default(0).notNull(),
  responseTimeMs: integer("response_time_ms").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const childBadges = pgTable(
  "child_badges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    childProfileId: uuid("child_profile_id")
      .notNull()
      .references(() => childProfiles.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    sourceMissionId: uuid("source_mission_id").references(() => missions.id, { onDelete: "set null" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("child_badge_unique").on(table.childProfileId, table.badgeId)],
);

export const activitySummaries = pgTable(
  "activity_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    childProfileId: uuid("child_profile_id")
      .notNull()
      .references(() => childProfiles.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    missionsCompleted: integer("missions_completed").default(0).notNull(),
    questionsCompleted: integer("questions_completed").default(0).notNull(),
    minutesPlayed: integer("minutes_played").default(0).notNull(),
    skillStats: jsonb("skill_stats").$type<Record<string, number>>().default({}).notNull(),
    hintUsedCount: integer("hint_used_count").default(0).notNull(),
    retryCount: integer("retry_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("activity_child_date_unique").on(table.childProfileId, table.date)],
);

export const conversationSuggestions = pgTable("conversation_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  questionText: text("question_text").notNull(),
  purpose: text("purpose").notNull(),
  ageGroup: ageGroupCode("age_group"),
  relatedMissionId: uuid("related_mission_id").references(() => missions.id, { onDelete: "set null" }),
  skillId: uuid("skill_id").references(() => skills.id, { onDelete: "set null" }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const parentResources = pgTable(
  "parent_resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    resourceType: parentResourceType("resource_type").default("article").notNull(),
    category: text("category").$type<ParentResourceCategory>().notNull(),
    ageGroups: jsonb("age_groups").$type<AgeGroup[]>().default([]).notNull(),
    coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.id, { onDelete: "set null" }),
    coverUrl: text("cover_url"),
    mediaUrl: text("media_url"),
    status: contentStatus("status").default("draft").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("parent_resources_filter_idx").on(
      table.status,
      table.resourceType,
      table.category,
      table.publishedAt,
    ),
  ],
);

export const contentEntries = pgTable(
  "content_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    namespace: text("namespace").notNull(),
    key: text("key").notNull(),
    locale: text("locale").default("vi").notNull(),
    category: text("category").default("general").notNull(),
    valueType: contentValueType("value_type").default("text").notNull(),
    value: jsonb("value").$type<unknown>().notNull(),
    description: text("description"),
    active: boolean("active").default(true).notNull(),
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("content_entry_namespace_key_locale_idx").on(table.namespace, table.key, table.locale),
    index("content_entry_namespace_idx").on(table.namespace, table.locale, table.active),
    index("content_entry_filter_idx").on(table.namespace, table.category, table.valueType, table.active),
  ],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentProfileId: uuid("parent_profile_id")
    .notNull()
    .references(() => parentProfiles.id, { onDelete: "cascade" }),
  childProfileId: uuid("child_profile_id").references(() => childProfiles.id, { onDelete: "cascade" }),
  type: notificationType("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const systemFeedback = pgTable(
  "system_feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    pagePath: text("page_path").notNull(),
    pageTitle: text("page_title"),
    context: jsonb("context").$type<Record<string, unknown>>().default({}).notNull(),
    status: feedbackStatus("status").default("new").notNull(),
    adminNote: text("admin_note"),
    handledBy: text("handled_by").references(() => user.id, { onDelete: "set null" }),
    handledAt: timestamp("handled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("system_feedback_status_created_idx").on(table.status, table.createdAt),
    index("system_feedback_user_created_idx").on(table.userId, table.createdAt),
    check("system_feedback_content_length", sql`char_length(${table.content}) between 10 and 4000`),
  ],
);

export const systemFeedbackAttachments = pgTable(
  "system_feedback_attachments",
  {
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => systemFeedback.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.feedbackId, table.mediaAssetId] }),
    unique("system_feedback_attachment_order_unique").on(table.feedbackId, table.sortOrder),
    index("system_feedback_attachment_media_idx").on(table.mediaAssetId),
  ],
);

export const dataRequests = pgTable("data_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentProfileId: uuid("parent_profile_id")
    .notNull()
    .references(() => parentProfiles.id, { onDelete: "cascade" }),
  type: dataRequestType("type").notNull(),
  status: requestStatus("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  downloadUrl: text("download_url"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
});

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventName: text("event_name").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    childProfileId: uuid("child_profile_id").references(() => childProfiles.id, { onDelete: "set null" }),
    missionId: uuid("mission_id").references(() => missions.id, { onDelete: "set null" }),
    sessionId: uuid("session_id").references(() => missionSessions.id, { onDelete: "set null" }),
    properties: jsonb("properties").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("analytics_event_created_idx").on(table.eventName, table.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id"),
    beforeState: jsonb("before_state").$type<unknown>(),
    afterState: jsonb("after_state").$type<unknown>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("audit_resource_created_idx").on(table.resourceType, table.createdAt)],
);

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
