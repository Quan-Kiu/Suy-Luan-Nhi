import { and, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db/client";
import {
  activitySummaries,
  auditLogs,
  childBadges,
  childProfiles,
  dataRequests,
  missionSessions,
  parentProfiles,
  questionAttempts,
  sessionQuestionStates,
} from "@/db/schema";
import { hashPin } from "@/modules/family/pin";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";
import { getSelectableChildAvatar, InvalidChildAvatarError } from "@/modules/family/child-avatars";
import type { z } from "zod";
import type { createChildSchema, updateChildSchema, updateParentSettingsSchema } from "./schemas";

export const getOrCreateParentProfile = cache(async (userId: string, displayName: string) => {
  const existing = await db.query.parentProfiles.findFirst({ where: eq(parentProfiles.userId, userId) });
  if (existing) return existing;

  const [created] = await db
    .insert(parentProfiles)
    .values({ userId, displayName })
    .onConflictDoNothing({ target: parentProfiles.userId })
    .returning();
  if (created) return created;

  const concurrent = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.userId, userId),
  });
  if (concurrent) return concurrent;
  throw new Error("Không thể khởi tạo hồ sơ phụ huynh");
});

export async function listChildren(userId: string, displayName: string, includeDeleted = false) {
  const parent = await getOrCreateParentProfile(userId, displayName);
  return db.query.childProfiles.findMany({
    where: includeDeleted
      ? eq(childProfiles.parentProfileId, parent.id)
      : and(eq(childProfiles.parentProfileId, parent.id), isNull(childProfiles.deletedAt)),
    orderBy: [desc(childProfiles.updatedAt)],
  });
}

export async function getOwnedChild(userId: string, childId: string) {
  return db
    .select({ child: childProfiles, parent: parentProfiles })
    .from(childProfiles)
    .innerJoin(parentProfiles, eq(childProfiles.parentProfileId, parentProfiles.id))
    .where(
      and(eq(parentProfiles.userId, userId), eq(childProfiles.id, childId), isNull(childProfiles.deletedAt)),
    )
    .then((rows) => rows[0] ?? null);
}

export async function getOwnedDeletedChild(userId: string, childId: string) {
  return db
    .select({ child: childProfiles, parent: parentProfiles })
    .from(childProfiles)
    .innerJoin(parentProfiles, eq(childProfiles.parentProfileId, parentProfiles.id))
    .where(
      and(
        eq(parentProfiles.userId, userId),
        eq(childProfiles.id, childId),
        isNotNull(childProfiles.deletedAt),
      ),
    )
    .then((rows) => rows[0] ?? null);
}

export class ChildProfileLimitError extends Error {
  constructor(readonly limit: number) {
    super(`Mỗi gia đình chỉ được tạo tối đa ${limit} hồ sơ bé`);
    this.name = "ChildProfileLimitError";
  }
}

export async function createChild(
  userId: string,
  parentName: string,
  input: z.infer<typeof createChildSchema>,
) {
  const [parent, systemSettings, avatar] = await Promise.all([
    getOrCreateParentProfile(userId, parentName),
    getOperationalSystemSettings(),
    getSelectableChildAvatar(input.avatarAssetId),
  ]);
  if (!avatar) throw new InvalidChildAvatarError();
  const profileInput = {
    displayName: input.displayName,
    ageGroup: input.ageGroup,
    mascotId: input.mascotId,
  };
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select 1 from ${parentProfiles} where ${parentProfiles.id} = ${parent.id} for update`,
    );
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(childProfiles)
      .where(and(eq(childProfiles.parentProfileId, parent.id), isNull(childProfiles.deletedAt)));
    if ((count ?? 0) >= systemSettings.limits.maxChildProfiles) {
      throw new ChildProfileLimitError(systemSettings.limits.maxChildProfiles);
    }
    const [child] = await tx
      .insert(childProfiles)
      .values({
        parentProfileId: parent.id,
        ...profileInput,
        avatarAssetId: avatar.id,
        avatarUrl: avatar.url,
      })
      .returning();
    await tx.insert(auditLogs).values({
      actorId: userId,
      action: "child.created",
      resourceType: "child_profile",
      resourceId: child.id,
      afterState: child,
    });
    return child;
  });
}

export async function updateChild(userId: string, childId: string, input: z.infer<typeof updateChildSchema>) {
  const owned = await getOwnedChild(userId, childId);
  if (!owned) return null;
  const avatar = input.avatarAssetId ? await getSelectableChildAvatar(input.avatarAssetId) : null;
  if (input.avatarAssetId && !avatar) throw new InvalidChildAvatarError();
  const profileInput = {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.ageGroup !== undefined ? { ageGroup: input.ageGroup } : {}),
    ...(input.mascotId !== undefined ? { mascotId: input.mascotId } : {}),
  };
  const [updated] = await db
    .update(childProfiles)
    .set({
      ...profileInput,
      ...(avatar ? { avatarAssetId: avatar.id, avatarUrl: avatar.url } : {}),
      updatedAt: new Date(),
    })
    .where(eq(childProfiles.id, childId))
    .returning();
  await db.insert(auditLogs).values({
    actorId: userId,
    action: "child.updated",
    resourceType: "child_profile",
    resourceId: childId,
    beforeState: owned.child,
    afterState: updated,
  });
  return updated;
}

export async function softDeleteChild(userId: string, childId: string) {
  const owned = await getOwnedChild(userId, childId);
  if (!owned) return null;
  const now = new Date();
  const [deleted] = await db
    .update(childProfiles)
    .set({ status: "pending_deletion", deletionRequestedAt: now, deletedAt: now, updatedAt: now })
    .where(and(eq(childProfiles.id, childId), isNull(childProfiles.deletedAt)))
    .returning();
  if (!deleted) return null;
  await db.insert(auditLogs).values({
    actorId: userId,
    action: "child.delete_requested",
    resourceType: "child_profile",
    resourceId: childId,
    beforeState: owned.child,
    afterState: deleted,
  });
  return deleted;
}

export async function restoreChild(userId: string, childId: string) {
  const [owned, systemSettings] = await Promise.all([
    getOwnedDeletedChild(userId, childId),
    getOperationalSystemSettings(),
  ]);
  if (!owned) return null;
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select 1 from ${parentProfiles} where ${parentProfiles.id} = ${owned.parent.id} for update`,
    );
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(childProfiles)
      .where(and(eq(childProfiles.parentProfileId, owned.parent.id), isNull(childProfiles.deletedAt)));
    if ((count ?? 0) >= systemSettings.limits.maxChildProfiles) {
      throw new ChildProfileLimitError(systemSettings.limits.maxChildProfiles);
    }
    const now = new Date();
    const [restored] = await tx
      .update(childProfiles)
      .set({ status: "active", deletionRequestedAt: null, deletedAt: null, updatedAt: now })
      .where(and(eq(childProfiles.id, childId), isNotNull(childProfiles.deletedAt)))
      .returning();
    if (!restored) return null;
    await tx.insert(auditLogs).values({
      actorId: userId,
      action: "child.restored",
      resourceType: "child_profile",
      resourceId: childId,
      beforeState: owned.child,
      afterState: restored,
    });
    return restored;
  });
}

export async function permanentlyDeleteChild(userId: string, childId: string) {
  const owned = await getOwnedDeletedChild(userId, childId);
  if (!owned) return null;
  return db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(childProfiles)
      .where(and(eq(childProfiles.id, childId), isNotNull(childProfiles.deletedAt)))
      .returning();
    if (!deleted) return null;
    await tx.insert(auditLogs).values({
      actorId: userId,
      action: "child.deleted_permanently",
      resourceType: "child_profile",
      resourceId: childId,
      beforeState: owned.child,
    });
    return deleted;
  });
}

export async function resetChildProgress(userId: string, childId: string) {
  const owned = await getOwnedChild(userId, childId);
  if (!owned) return false;
  await db.transaction(async (tx) => {
    const sessions = await tx
      .select({ id: missionSessions.id })
      .from(missionSessions)
      .where(eq(missionSessions.childProfileId, childId));
    const sessionIds = sessions.map((session) => session.id);
    for (const sessionId of sessionIds) {
      await tx.delete(questionAttempts).where(eq(questionAttempts.sessionId, sessionId));
      await tx.delete(sessionQuestionStates).where(eq(sessionQuestionStates.sessionId, sessionId));
    }
    await tx.delete(missionSessions).where(eq(missionSessions.childProfileId, childId));
    await tx.delete(childBadges).where(eq(childBadges.childProfileId, childId));
    await tx.delete(activitySummaries).where(eq(activitySummaries.childProfileId, childId));
    await tx.insert(auditLogs).values({
      actorId: userId,
      action: "child.progress_reset",
      resourceType: "child_profile",
      resourceId: childId,
    });
  });
  return true;
}

export class ParentPinAlreadyConfiguredError extends Error {
  constructor() {
    super("Mã PIN phụ huynh đã được thiết lập");
    this.name = "ParentPinAlreadyConfiguredError";
  }
}

export async function setupParentPin(userId: string, parentName: string, pin: string) {
  const [parent, pinHash] = await Promise.all([getOrCreateParentProfile(userId, parentName), hashPin(pin)]);
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select 1 from ${parentProfiles} where ${parentProfiles.id} = ${parent.id} for update`,
    );
    const current = await tx.query.parentProfiles.findFirst({
      where: eq(parentProfiles.id, parent.id),
    });
    if (!current) throw new Error("Không tìm thấy hồ sơ phụ huynh");
    if (current.pinHash) throw new ParentPinAlreadyConfiguredError();

    const [updated] = await tx
      .update(parentProfiles)
      .set({
        pinHash,
        pinFailedAttempts: 0,
        pinLockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(parentProfiles.id, parent.id))
      .returning();
    await tx.insert(auditLogs).values({
      actorId: userId,
      action: "parent.pin_created",
      resourceType: "parent_profile",
      resourceId: parent.id,
      beforeState: { ...current, pinHash: null },
      afterState: { ...updated, pinHash: "[redacted]" },
    });
    return updated;
  });
}

export async function updateParentSettings(
  userId: string,
  parentName: string,
  input: z.infer<typeof updateParentSettingsSchema>,
) {
  const parent = await getOrCreateParentProfile(userId, parentName);
  const { pin, ...settings } = input;
  const [updated] = await db
    .update(parentProfiles)
    .set({
      ...settings,
      pinHash: pin ? await hashPin(pin) : parent.pinHash,
      pinFailedAttempts: pin ? 0 : parent.pinFailedAttempts,
      pinLockedUntil: pin ? null : parent.pinLockedUntil,
      updatedAt: new Date(),
    })
    .where(eq(parentProfiles.id, parent.id))
    .returning();
  await db.insert(auditLogs).values({
    actorId: userId,
    action: "parent.settings_updated",
    resourceType: "parent_profile",
    resourceId: parent.id,
    beforeState: { ...parent, pinHash: parent.pinHash ? "[redacted]" : null },
    afterState: { ...updated, pinHash: updated.pinHash ? "[redacted]" : null },
  });
  return updated;
}

export async function createDataRequest(userId: string, parentName: string, type: "export" | "delete") {
  const parent = await getOrCreateParentProfile(userId, parentName);
  const [request] = await db
    .insert(dataRequests)
    .values({ parentProfileId: parent.id, type, metadata: { requestedBy: userId } })
    .returning();
  await db.insert(auditLogs).values({
    actorId: userId,
    action: `data.${type}_requested`,
    resourceType: "data_request",
    resourceId: request.id,
  });
  return request;
}

export async function createExportRequest(userId: string, parentName: string) {
  const parent = await getOrCreateParentProfile(userId, parentName);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const [request] = await db
    .insert(dataRequests)
    .values({
      parentProfileId: parent.id,
      type: "export",
      status: "completed",
      completedAt: new Date(),
      expiresAt,
      metadata: { requestedBy: userId },
    })
    .returning();
  const downloadUrl = `/api/parent/export-data/${request.id}`;
  await db.update(dataRequests).set({ downloadUrl }).where(eq(dataRequests.id, request.id));
  await db.insert(auditLogs).values({
    actorId: userId,
    action: "data.export_requested",
    resourceType: "data_request",
    resourceId: request.id,
  });
  return { ...request, downloadUrl, expiresAt };
}

export async function getExportPackage(userId: string, requestId: string) {
  const rows = await db
    .select({ request: dataRequests, parent: parentProfiles })
    .from(dataRequests)
    .innerJoin(parentProfiles, eq(dataRequests.parentProfileId, parentProfiles.id))
    .where(and(eq(dataRequests.id, requestId), eq(parentProfiles.userId, userId)))
    .limit(1);
  const owned = rows[0];
  if (
    !owned ||
    owned.request.type !== "export" ||
    owned.request.status !== "completed" ||
    !owned.request.expiresAt ||
    owned.request.expiresAt <= new Date()
  ) {
    return null;
  }
  const children = await listChildren(userId, owned.parent.displayName, true);
  const childData = await Promise.all(
    children.map(async (child) => ({
      profile: child,
      sessions: await db.query.missionSessions.findMany({
        where: eq(missionSessions.childProfileId, child.id),
      }),
      badges: await db.query.childBadges.findMany({
        where: eq(childBadges.childProfileId, child.id),
      }),
      activity: await db.query.activitySummaries.findMany({
        where: eq(activitySummaries.childProfileId, child.id),
      }),
    })),
  );
  return {
    exportedAt: new Date().toISOString(),
    parent: {
      displayName: owned.parent.displayName,
      soundEnabled: owned.parent.soundEnabled,
      effectsEnabled: owned.parent.effectsEnabled,
      notificationSettings: owned.parent.notificationSettings,
      privacySettings: owned.parent.privacySettings,
    },
    children: childData,
  };
}
