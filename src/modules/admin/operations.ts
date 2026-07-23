import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";
import { missingWorldAgeGroups } from "@/domain/mission-publication";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";
import { assertMemberUpdatePolicy } from "@/modules/admin/member-policy";
import { clearOperationalSystemSettingsCache } from "@/modules/system-settings/runtime";
import {
  ageGroups,
  account,
  analyticsEvents,
  auditLogs,
  childProfiles,
  dataRequests,
  mediaAssets,
  missionSessions,
  missionVersions,
  missionWorlds,
  missions,
  worldAgeGroups,
  notifications,
  parentProfiles,
  questionAttempts,
  session,
  skills,
  systemSettings,
  user,
} from "@/db/schema";

export async function getAdminDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [missionCounts, userCount, childCount, sessionCount, pendingReviews, mediaPending, recentAudit] =
    await Promise.all([
      db
        .select({ status: missions.status, count: sql<number>`count(*)::int` })
        .from(missions)
        .groupBy(missions.status),
      db.select({ count: sql<number>`count(*)::int` }).from(user),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(childProfiles)
        .where(sql`${childProfiles.deletedAt} is null`),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(missionSessions)
        .where(gte(missionSessions.startedAt, since)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(missionVersions)
        .where(eq(missionVersions.status, "in_review")),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(mediaAssets)
        .where(eq(mediaAssets.safetyStatus, "pending")),
      db.query.auditLogs.findMany({ orderBy: [desc(auditLogs.createdAt)], limit: 8 }),
    ]);
  return {
    missionCounts: Object.fromEntries(missionCounts.map((row) => [row.status, row.count])),
    users: userCount[0]?.count ?? 0,
    children: childCount[0]?.count ?? 0,
    sessions30d: sessionCount[0]?.count ?? 0,
    pendingReviews: pendingReviews[0]?.count ?? 0,
    pendingMedia: mediaPending[0]?.count ?? 0,
    recentAudit,
  };
}

export async function getAdminReports() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [sessionsByStatus, attempts, events, topMissions, reviewCycle] = await Promise.all([
    db
      .select({ status: missionSessions.status, count: sql<number>`count(*)::int` })
      .from(missionSessions)
      .where(gte(missionSessions.startedAt, since))
      .groupBy(missionSessions.status),
    db
      .select({
        total: sql<number>`count(*)::int`,
        correct: sql<number>`count(*) filter (where ${questionAttempts.isCorrect})::int`,
        averageMs: sql<number>`coalesce(avg(${questionAttempts.responseTimeMs}),0)::int`,
      })
      .from(questionAttempts)
      .where(gte(questionAttempts.createdAt, since)),
    db
      .select({ eventName: analyticsEvents.eventName, count: sql<number>`count(*)::int` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .groupBy(analyticsEvents.eventName)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({ title: missions.title, count: sql<number>`count(${missionSessions.id})::int` })
      .from(missionSessions)
      .innerJoin(missions, eq(missionSessions.missionId, missions.id))
      .where(gte(missionSessions.startedAt, since))
      .groupBy(missions.id, missions.title)
      .orderBy(desc(sql`count(${missionSessions.id})`))
      .limit(10),
    db
      .select({
        averageHours: sql<number>`coalesce(avg(extract(epoch from (${missionVersions.reviewedAt} - ${missionVersions.createdAt})) / 3600),0)::float`,
      })
      .from(missionVersions)
      .where(sql`${missionVersions.reviewedAt} is not null and ${missionVersions.createdAt} >= ${since}`),
  ]);
  return {
    sessionsByStatus: Object.fromEntries(sessionsByStatus.map((row) => [row.status, row.count])),
    attempts: attempts[0] ?? { total: 0, correct: 0, averageMs: 0 },
    events,
    topMissions,
    averageReviewHours: reviewCycle[0]?.averageHours ?? 0,
  };
}

export async function listMembers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      parentProfileId: parentProfiles.id,
    })
    .from(user)
    .leftJoin(parentProfiles, eq(parentProfiles.userId, user.id))
    .orderBy(desc(user.createdAt));
}

export async function updateMember(
  actorId: string,
  userId: string,
  input: { role?: string; banned?: boolean; banReason?: string | null },
) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('sln:member-policy'))`);
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`sln:user-session:${userId}`}))`);

    const current = await tx.query.user.findFirst({ where: eq(user.id, userId) });
    if (!current) return null;

    const nextRole = input.role ?? current.role;
    const nextBanned = input.banned ?? current.banned;
    const policyInput = {
      actorId,
      userId,
      currentRole: current.role,
      currentBanned: current.banned,
      nextRole,
      nextBanned,
      roleWasProvided: input.role !== undefined,
      banWasRequested: input.banned === true,
    };
    assertMemberUpdatePolicy(policyInput);

    const removesActiveSuperAdmin =
      current.role === "super_admin" && !current.banned && (nextRole !== "super_admin" || nextBanned);
    if (removesActiveSuperAdmin) {
      const activeSuperAdmins = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(user)
        .where(and(eq(user.role, "super_admin"), eq(user.banned, false)));
      assertMemberUpdatePolicy({
        ...policyInput,
        activeSuperAdminCount: activeSuperAdmins[0]?.count ?? 0,
      });
    }

    const revokedSessions = nextBanned
      ? await tx.delete(session).where(eq(session.userId, userId)).returning({ id: session.id })
      : [];
    const [updated] = await tx
      .update(user)
      .set({
        role: nextRole,
        banned: nextBanned,
        banReason: nextBanned
          ? (input.banReason ?? current.banReason ?? "Tạm ngưng bởi quản trị viên")
          : null,
        banExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    await tx.insert(auditLogs).values({
      actorId,
      action: "member.updated",
      resourceType: "user",
      resourceId: userId,
      beforeState: { ...current, email: "[redacted]" },
      afterState: { ...updated, email: "[redacted]" },
    });
    if (nextBanned) {
      await tx.insert(auditLogs).values({
        actorId,
        action: "session.revoked_by_ban",
        resourceType: "user_session",
        resourceId: userId,
        metadata: {
          revokedSessionCount: revokedSessions.length,
          reason: updated.banReason,
        },
      });
    }
    return updated;
  });
}

function sortWorldAgeGroups(values: readonly AgeGroup[]) {
  return ageGroupCodes.filter((ageGroup) => values.includes(ageGroup));
}

function requireWorldAgeGroups(values: readonly AgeGroup[]) {
  const normalized = sortWorldAgeGroups(values);
  if (!normalized.length) throw new Error("WORLD_AGE_GROUP_REQUIRED");
  return normalized;
}

export class WorldAudienceConflictError extends Error {
  constructor(readonly missingAgeGroups: AgeGroup[]) {
    super(`Chủ đề đang có nhiệm vụ đã xuất bản cho nhóm tuổi: ${missingAgeGroups.join(", ")}`);
    this.name = "WorldAudienceConflictError";
  }
}

export class WorldPublishedMissionConflictError extends Error {
  constructor(readonly publishedMissionCount: number) {
    super(
      `Chủ đề đang có ${publishedMissionCount} nhiệm vụ hiển thị. Hãy lưu trữ các nhiệm vụ trước khi ẩn chủ đề.`,
    );
    this.name = "WorldPublishedMissionConflictError";
  }
}

async function getPublishedWorldDependencies(worldId: string) {
  const rows = await db
    .select({ missionId: missions.id, snapshot: missionVersions.snapshot })
    .from(missions)
    .leftJoin(missionVersions, eq(missionVersions.id, missions.publishedVersionId))
    .where(and(eq(missions.worldId, worldId), eq(missions.status, "published")));
  const required = new Set<AgeGroup>();
  for (const row of rows) {
    if (!row.snapshot) continue;
    for (const ageGroup of parseMissionSnapshot(row.snapshot).ageGroups) required.add(ageGroup);
  }
  return {
    publishedMissionCount: rows.length,
    requiredAgeGroups: ageGroupCodes.filter((ageGroup) => required.has(ageGroup)),
  };
}

export type AdminWorldInput = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  sortOrder: number;
  themeColor: string;
  coverUrl: string;
  ageGroups: AgeGroup[];
};

export async function listAdminWorlds() {
  const [worlds, ageRows] = await Promise.all([
    db.select().from(missionWorlds).orderBy(asc(missionWorlds.sortOrder)),
    db.select().from(worldAgeGroups),
  ]);
  return worlds.map((world) => ({
    ...world,
    ageGroups: sortWorldAgeGroups(
      ageRows.filter((row) => row.worldId === world.id).map((row) => row.ageGroup),
    ),
  }));
}

export async function createWorld(actorId: string, input: AdminWorldInput) {
  const { ageGroups, ...worldInput } = input;
  const selectedAgeGroups = requireWorldAgeGroups(ageGroups);
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(missionWorlds)
      .values({ ...worldInput, status: "draft" })
      .returning();
    await tx
      .insert(worldAgeGroups)
      .values(selectedAgeGroups.map((ageGroup) => ({ worldId: created.id, ageGroup })));
    await tx.insert(auditLogs).values({
      actorId,
      action: "world.created",
      resourceType: "mission_world",
      resourceId: created.id,
      afterState: { ...created, ageGroups: selectedAgeGroups },
    });
    return { ...created, ageGroups: selectedAgeGroups };
  });
}

export async function updateWorld(
  actorId: string,
  worldId: string,
  input: Partial<Omit<AdminWorldInput, "slug">> & {
    status?: "draft" | "published" | "archived";
  },
) {
  const current = await db.query.missionWorlds.findFirst({ where: eq(missionWorlds.id, worldId) });
  if (!current) return null;
  const currentAgeGroups = await db
    .select({ ageGroup: worldAgeGroups.ageGroup })
    .from(worldAgeGroups)
    .where(eq(worldAgeGroups.worldId, worldId));
  const previousAgeGroups = sortWorldAgeGroups(currentAgeGroups.map((row) => row.ageGroup));
  const { ageGroups, ...worldInput } = input;
  const selectedAgeGroups = ageGroups ? requireWorldAgeGroups(ageGroups) : previousAgeGroups;
  const resultingStatus = input.status ?? current.status;
  const dependencies = await getPublishedWorldDependencies(worldId);
  if (resultingStatus !== "published" && dependencies.publishedMissionCount > 0) {
    throw new WorldPublishedMissionConflictError(dependencies.publishedMissionCount);
  }
  if (resultingStatus === "published") {
    const missingAgeGroups = missingWorldAgeGroups(dependencies.requiredAgeGroups, selectedAgeGroups);
    if (missingAgeGroups.length) throw new WorldAudienceConflictError(missingAgeGroups);
  }
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(missionWorlds)
      .set({ ...worldInput, updatedAt: new Date() })
      .where(eq(missionWorlds.id, worldId))
      .returning();
    if (ageGroups) {
      await tx.delete(worldAgeGroups).where(eq(worldAgeGroups.worldId, worldId));
      await tx.insert(worldAgeGroups).values(selectedAgeGroups.map((ageGroup) => ({ worldId, ageGroup })));
    }
    await tx.insert(auditLogs).values({
      actorId,
      action: "world.updated",
      resourceType: "mission_world",
      resourceId: worldId,
      beforeState: { ...current, ageGroups: previousAgeGroups },
      afterState: { ...updated, ageGroups: selectedAgeGroups },
    });
    return { ...updated, ageGroups: selectedAgeGroups };
  });
}

export async function createSkill(
  actorId: string,
  input: { slug: string; title: string; description: string; category: string },
) {
  const [created] = await db.insert(skills).values(input).returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "skill.created",
    resourceType: "skill",
    resourceId: created.id,
    afterState: created,
  });
  return created;
}

export async function updateSkill(
  actorId: string,
  skillId: string,
  input: Partial<{ title: string; description: string; category: string; active: boolean }>,
) {
  const current = await db.query.skills.findFirst({ where: eq(skills.id, skillId) });
  if (!current) return null;
  const [updated] = await db
    .update(skills)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(skills.id, skillId))
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "skill.updated",
    resourceType: "skill",
    resourceId: skillId,
    beforeState: current,
    afterState: updated,
  });
  return updated;
}

export async function updateAgeGroup(
  actorId: string,
  code: "6-8" | "9-10" | "11-12",
  input: Partial<{
    label: string;
    description: string;
    minAge: number;
    maxAge: number;
    sortOrder: number;
    active: boolean;
  }>,
) {
  const current = await db.query.ageGroups.findFirst({ where: eq(ageGroups.code, code) });
  if (!current) return null;
  const [updated] = await db.update(ageGroups).set(input).where(eq(ageGroups.code, code)).returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "age_group.updated",
    resourceType: "age_group",
    resourceId: code,
    beforeState: current,
    afterState: updated,
  });
  return updated;
}

export async function listAuditLogs(
  filters: { resourceType?: string; action?: string; limit?: number } = {},
) {
  const conditions = [];
  if (filters.resourceType) conditions.push(eq(auditLogs.resourceType, filters.resourceType));
  if (filters.action) conditions.push(sql`${auditLogs.action} ilike ${`%${filters.action}%`}`);
  return db.query.auditLogs.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(auditLogs.createdAt)],
    limit: Math.min(filters.limit ?? 100, 500),
  });
}

export async function getSystemSettings() {
  return db.query.systemSettings.findMany({ orderBy: [asc(systemSettings.key)] });
}

export async function setSystemSetting(actorId: string, key: string, value: unknown) {
  const current = await db.query.systemSettings.findFirst({ where: eq(systemSettings.key, key) });
  const [setting] = await db
    .insert(systemSettings)
    .values({ key, value, updatedBy: actorId })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: { value, updatedBy: actorId, updatedAt: new Date() },
    })
    .returning();
  await db.insert(auditLogs).values({
    actorId,
    action: "system_setting.updated",
    resourceType: "system_setting",
    resourceId: key,
    beforeState: current ? { value: current.value } : undefined,
    afterState: { value },
  });
  clearOperationalSystemSettingsCache();
  return setting;
}

export async function processDeleteDataRequest(actorId: string, requestId: string) {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({ request: dataRequests, parent: parentProfiles, owner: user })
      .from(dataRequests)
      .innerJoin(parentProfiles, eq(dataRequests.parentProfileId, parentProfiles.id))
      .innerJoin(user, eq(parentProfiles.userId, user.id))
      .where(
        and(
          eq(dataRequests.id, requestId),
          eq(dataRequests.type, "delete"),
          eq(dataRequests.status, "pending"),
        ),
      )
      .limit(1);
    const owned = rows[0];
    if (!owned) return null;
    const completedAt = new Date();
    await tx.update(dataRequests).set({ status: "processing" }).where(eq(dataRequests.id, requestId));
    await tx.delete(childProfiles).where(eq(childProfiles.parentProfileId, owned.parent.id));
    await tx.delete(notifications).where(eq(notifications.parentProfileId, owned.parent.id));
    await tx.delete(session).where(eq(session.userId, owned.owner.id));
    await tx.delete(account).where(eq(account.userId, owned.owner.id));
    await tx
      .update(parentProfiles)
      .set({
        displayName: "Đã xóa",
        pinHash: null,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        notificationSettings: {},
        privacySettings: {},
        updatedAt: completedAt,
      })
      .where(eq(parentProfiles.id, owned.parent.id));
    await tx
      .update(user)
      .set({
        name: "Tài khoản đã xóa",
        email: `deleted+${owned.owner.id}@privacy.invalid`,
        image: null,
        banned: true,
        banReason: "Dữ liệu đã được xóa theo yêu cầu",
        updatedAt: completedAt,
      })
      .where(eq(user.id, owned.owner.id));
    await tx
      .update(dataRequests)
      .set({
        status: "completed",
        completedAt,
        metadata: { processedBy: actorId },
      })
      .where(eq(dataRequests.id, requestId));
    await tx.insert(auditLogs).values({
      actorId,
      action: "data.delete_completed",
      resourceType: "data_request",
      resourceId: requestId,
      metadata: { anonymizedUserId: owned.owner.id },
    });
    return { id: requestId, status: "completed" as const };
  });
}
