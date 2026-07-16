import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
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
} from "@/db/schema";

export async function getParentDashboard(childId: string, parentProfileId: string) {
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
  const recentSessions = await db
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
    .limit(6);
  const earnedBadges = await db
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
    .orderBy(desc(childBadges.unlockedAt));
  const unread = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.parentProfileId, parentProfileId), sql`${notifications.readAt} is null`));
  return {
    activity,
    totals,
    skills: [...skillTotals.entries()].sort((a, b) => b[1] - a[1]),
    recentSessions,
    earnedBadges,
    unreadNotifications: unread[0]?.count ?? 0,
  };
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

export async function getSuggestions(ageGroup: "2-3" | "4-5" | "6-8") {
  return db.query.conversationSuggestions.findMany({
    where: and(
      eq(conversationSuggestions.active, true),
      sql`${conversationSuggestions.ageGroup} is null or ${conversationSuggestions.ageGroup} = ${ageGroup}`,
    ),
    orderBy: [desc(conversationSuggestions.createdAt)],
  });
}

export async function getResources() {
  return db.query.parentResources.findMany({
    where: eq(parentResources.status, "published"),
    orderBy: [parentResources.sortOrder],
  });
}

export async function getResource(slug: string) {
  return db.query.parentResources.findFirst({
    where: and(eq(parentResources.status, "published"), eq(parentResources.slug, slug)),
  });
}

export async function getParentNotifications(parentProfileId: string) {
  return db.query.notifications.findMany({
    where: eq(notifications.parentProfileId, parentProfileId),
    orderBy: [desc(notifications.createdAt)],
    limit: 50,
  });
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
