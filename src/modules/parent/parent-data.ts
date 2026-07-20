import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/client";
import type { AgeGroup } from "@/domain/age-groups";
import type { ParentResourceCategory, ParentResourceType } from "@/domain/parent-resources";
import { cacheTags } from "@/lib/cache/tags";
import { buildSkillSummaries } from "@/modules/parent/skill-summary";
import {
  activitySummaries,
  childBadges,
  conversationSuggestions,
  missionSessions,
  missions,
  notifications,
  parentProfiles,
  parentResources,
  badges,
  skills,
} from "@/db/schema";

async function readParentDashboard(childId: string, parentProfileId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const activity = await db.query.activitySummaries.findMany({
    where: and(
      eq(activitySummaries.childProfileId, childId),
      gte(activitySummaries.date, since.toISOString().slice(0, 10)),
    ),
    orderBy: [desc(activitySummaries.date)],
  });
  const totals = activity.reduce(
    (result, day) => ({
      missions: result.missions + day.missionsCompleted,
      questions: result.questions + day.questionsCompleted,
      minutes: result.minutes + day.minutesPlayed,
      hints: result.hints + day.hintUsedCount,
      retries: result.retries + day.retryCount,
    }),
    { missions: 0, questions: 0, minutes: 0, hints: 0, retries: 0 },
  );
  const skillTotals = new Map<string, number>();
  for (const day of activity)
    for (const [skill, count] of Object.entries(day.skillStats))
      skillTotals.set(skill, (skillTotals.get(skill) ?? 0) + count);
  const skillSlugs = [...skillTotals.keys()];
  const [skillDefinitions, recentSessions, earnedBadges, unread] = await Promise.all([
    skillSlugs.length
      ? db
          .select({ slug: skills.slug, title: skills.title })
          .from(skills)
          .where(inArray(skills.slug, skillSlugs))
      : Promise.resolve([]),
    db
      .select({
        id: missionSessions.id,
        status: missionSessions.status,
        startedAt: missionSessions.startedAt,
        completedAt: missionSessions.completedAt,
        stars: missionSessions.stars,
        hints: missionSessions.hintUsedCount,
        retries: missionSessions.wrongAttemptCount,
        missionTitle: missions.title,
        missionCover: missions.coverUrl,
      })
      .from(missionSessions)
      .innerJoin(missions, eq(missionSessions.missionId, missions.id))
      .where(eq(missionSessions.childProfileId, childId))
      .orderBy(desc(missionSessions.startedAt))
      .limit(6),
    db
      .select({
        id: badges.id,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl,
        unlockedAt: childBadges.unlockedAt,
      })
      .from(childBadges)
      .innerJoin(badges, eq(childBadges.badgeId, badges.id))
      .where(eq(childBadges.childProfileId, childId))
      .orderBy(desc(childBadges.unlockedAt)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.parentProfileId, parentProfileId), sql`${notifications.readAt} is null`)),
  ]);
  return {
    activity,
    totals,
    skills: buildSkillSummaries(skillTotals, skillDefinitions),
    recentSessions,
    earnedBadges,
    unreadNotifications: unread[0]?.count ?? 0,
  };
}

export function getParentDashboard(childId: string, parentProfileId: string) {
  return unstable_cache(
    () => readParentDashboard(childId, parentProfileId),
    ["parent-dashboard", childId, parentProfileId],
    {
      tags: [cacheTags.parentDashboard(childId), cacheTags.parentNotifications(parentProfileId)],
      revalidate: 30,
    },
  )();
}

export async function getActivityHistory(
  childId: string,
  filters: { status?: string; from?: string; to?: string },
) {
  const conditions = [eq(missionSessions.childProfileId, childId)];
  if (filters.status === "completed" || filters.status === "in_progress" || filters.status === "exited")
    conditions.push(eq(missionSessions.status, filters.status));
  if (filters.from) conditions.push(gte(missionSessions.startedAt, new Date(filters.from)));
  if (filters.to)
    conditions.push(sql`${missionSessions.startedAt} <= ${new Date(`${filters.to}T23:59:59.999Z`)}`);
  return db
    .select({
      id: missionSessions.id,
      status: missionSessions.status,
      startedAt: missionSessions.startedAt,
      completedAt: missionSessions.completedAt,
      correctCount: missionSessions.correctCount,
      totalQuestions: missionSessions.totalQuestions,
      hints: missionSessions.hintUsedCount,
      retries: missionSessions.wrongAttemptCount,
      stars: missionSessions.stars,
      missionTitle: missions.title,
      missionCover: missions.coverUrl,
      missionSlug: missions.slug,
    })
    .from(missionSessions)
    .innerJoin(missions, eq(missionSessions.missionId, missions.id))
    .where(and(...conditions))
    .orderBy(desc(missionSessions.startedAt));
}

async function readSuggestions(ageGroup: "6-8" | "9-10" | "11-12") {
  return db.query.conversationSuggestions.findMany({
    where: and(
      eq(conversationSuggestions.active, true),
      sql`${conversationSuggestions.ageGroup} is null or ${conversationSuggestions.ageGroup} = ${ageGroup}`,
    ),
    orderBy: [desc(conversationSuggestions.createdAt)],
  });
}

export const getSuggestions = unstable_cache(readSuggestions, ["parent-suggestions"], {
  tags: [cacheTags.parentSuggestions],
  revalidate: 3600,
});

export type ParentResourceFilters = {
  ageGroup: AgeGroup;
  resourceType?: ParentResourceType;
  category?: ParentResourceCategory;
  search?: string;
  page?: number;
  pageSize?: number;
};

async function readResources(filters: ParentResourceFilters) {
  const conditions = [
    eq(parentResources.status, "published"),
    sql`${parentResources.ageGroups} @> ${JSON.stringify([filters.ageGroup])}::jsonb`,
  ];
  if (filters.resourceType) conditions.push(eq(parentResources.resourceType, filters.resourceType));
  if (filters.category) conditions.push(eq(parentResources.category, filters.category));
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    conditions.push(
      sql`(${parentResources.title} ilike ${`%${search}%`} or ${parentResources.excerpt} ilike ${`%${search}%`})`,
    );
  }
  const where = and(...conditions);
  const pageSize = Math.min(24, Math.max(3, Math.trunc(filters.pageSize ?? 9)));
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const [items, countRows, facetRows] = await Promise.all([
    db.query.parentResources.findMany({
      where,
      orderBy: [asc(parentResources.sortOrder), desc(parentResources.publishedAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(parentResources)
      .where(where),
    db
      .select({ resourceType: parentResources.resourceType, category: parentResources.category })
      .from(parentResources)
      .where(
        and(
          eq(parentResources.status, "published"),
          sql`${parentResources.ageGroups} @> ${JSON.stringify([filters.ageGroup])}::jsonb`,
        ),
      ),
  ]);
  const total = countRows[0]?.count ?? 0;
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    facets: {
      resourceTypes: [...new Set(facetRows.map((row) => row.resourceType))],
      categories: [...new Set(facetRows.map((row) => row.category))].sort(),
    },
  };
}

export const getResources = unstable_cache(readResources, ["parent-resources"], {
  tags: [cacheTags.parentResources],
  revalidate: 3600,
});

async function readResource(slug: string) {
  return db.query.parentResources.findFirst({
    where: and(eq(parentResources.status, "published"), eq(parentResources.slug, slug)),
  });
}

export const getResource = unstable_cache(readResource, ["parent-resource"], {
  tags: [cacheTags.parentResources],
  revalidate: 3600,
});

export async function getParentNotifications(parentProfileId: string) {
  return db.query.notifications.findMany({
    where: eq(notifications.parentProfileId, parentProfileId),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });
}

async function readUnreadNotificationCount(parentProfileId: string) {
  const rows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.parentProfileId, parentProfileId), sql`${notifications.readAt} is null`));
  return rows[0]?.count ?? 0;
}

export function getUnreadNotificationCount(parentProfileId: string) {
  return unstable_cache(
    () => readUnreadNotificationCount(parentProfileId),
    ["parent-unread-notifications", parentProfileId],
    { tags: [cacheTags.parentNotifications(parentProfileId)], revalidate: 30 },
  )();
}

export async function markNotificationRead(parentProfileId: string, notificationId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.parentProfileId, parentProfileId), eq(notifications.id, notificationId)));
}

export async function getParentProfile(userId: string) {
  return db.query.parentProfiles.findFirst({ where: eq(parentProfiles.userId, userId) });
}
