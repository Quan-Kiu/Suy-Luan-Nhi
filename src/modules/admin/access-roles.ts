import { asc, eq, isNull, sql } from "drizzle-orm";
import {
  expandPermissions,
  roleDefinitions,
  rolePermissionMap,
  type PermissionKey,
} from "@/auth/permissions";
import { systemRoleSchema, type SystemRole } from "@/auth/roles";
import { db } from "@/db/client";
import { accessRoles, auditLogs, user } from "@/db/schema";
import type { CreateAccessRoleInput, UpdateAccessRoleInput } from "@/domain/access-roles";

export const accessRoleErrorCodes = [
  "ROLE_KEY_RESERVED",
  "ROLE_KEY_EXISTS",
  "ROLE_NOT_FOUND",
  "ROLE_IN_USE",
] as const;
export type AccessRoleErrorCode = (typeof accessRoleErrorCodes)[number];

const accessRoleErrorMessages: Record<AccessRoleErrorCode, string> = {
  ROLE_KEY_RESERVED: "Mã role này được hệ thống bảo vệ và không thể dùng cho role tùy chỉnh.",
  ROLE_KEY_EXISTS: "Mã role đã tồn tại. Hãy chọn mã khác.",
  ROLE_NOT_FOUND: "Không tìm thấy role tùy chỉnh.",
  ROLE_IN_USE: "Role đang được gán cho thành viên nên chưa thể xóa.",
};

export class AccessRoleError extends Error {
  constructor(
    readonly code: AccessRoleErrorCode,
    readonly metadata: Record<string, unknown> = {},
  ) {
    super(accessRoleErrorMessages[code]);
    this.name = "AccessRoleError";
  }
}

export type AccessRoleItem = {
  key: string;
  name: string;
  description: string;
  permissions: PermissionKey[];
  system: boolean;
  memberCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

function normalizePermissions(values: readonly PermissionKey[]) {
  return expandPermissions(["admin.dashboard.view", ...values]);
}

function isReservedKey(key: string) {
  return key === "custom_staff" || systemRoleSchema.safeParse(key).success;
}

export async function listAccessRoles(): Promise<AccessRoleItem[]> {
  const [customRoles, systemCounts, customCounts] = await Promise.all([
    db.select().from(accessRoles).orderBy(asc(accessRoles.name)),
    db
      .select({ key: user.role, count: sql<number>`count(*)::int` })
      .from(user)
      .where(isNull(user.deletedAt))
      .groupBy(user.role),
    db
      .select({ key: user.accessRoleKey, count: sql<number>`count(*)::int` })
      .from(user)
      .groupBy(user.accessRoleKey),
  ]);
  const systemCountMap = new Map(systemCounts.map((item) => [item.key, item.count]));
  const customCountMap = new Map(customCounts.map((item) => [item.key, item.count]));
  const builtIns = systemRoleSchema.options.map((key: SystemRole): AccessRoleItem => ({
    key,
    name: roleDefinitions[key].label,
    description: roleDefinitions[key].description,
    permissions: [...rolePermissionMap[key]],
    system: true,
    memberCount: systemCountMap.get(key) ?? 0,
    createdAt: null,
    updatedAt: null,
  }));
  return [
    ...builtIns,
    ...customRoles.map((role): AccessRoleItem => ({
      key: role.key,
      name: role.name,
      description: role.description,
      permissions: normalizePermissions(role.permissions as PermissionKey[]),
      system: false,
      memberCount: customCountMap.get(role.key) ?? 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    })),
  ];
}

export async function createAccessRole(actorId: string, input: CreateAccessRoleInput) {
  if (isReservedKey(input.key)) throw new AccessRoleError("ROLE_KEY_RESERVED", { key: input.key });
  const existing = await db.query.accessRoles.findFirst({ where: eq(accessRoles.key, input.key) });
  if (existing) throw new AccessRoleError("ROLE_KEY_EXISTS", { key: input.key });
  try {
    return await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(accessRoles)
        .values({ ...input, permissions: normalizePermissions(input.permissions) })
        .returning();
      await tx.insert(auditLogs).values({
        actorId,
        action: "access_role.created",
        resourceType: "access_role",
        resourceId: created.key,
        afterState: created,
      });
      return created;
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new AccessRoleError("ROLE_KEY_EXISTS", { key: input.key });
    }
    throw error;
  }
}

export async function updateAccessRole(actorId: string, key: string, input: UpdateAccessRoleInput) {
  if (isReservedKey(key)) throw new AccessRoleError("ROLE_KEY_RESERVED", { key });
  return db.transaction(async (tx) => {
    const current = await tx.query.accessRoles.findFirst({ where: eq(accessRoles.key, key) });
    if (!current) throw new AccessRoleError("ROLE_NOT_FOUND", { key });
    const [updated] = await tx
      .update(accessRoles)
      .set({ ...input, permissions: normalizePermissions(input.permissions), updatedAt: new Date() })
      .where(eq(accessRoles.key, key))
      .returning();
    await tx.insert(auditLogs).values({
      actorId,
      action: "access_role.updated",
      resourceType: "access_role",
      resourceId: key,
      beforeState: current,
      afterState: updated,
    });
    return updated;
  });
}

export async function deleteAccessRole(actorId: string, key: string) {
  if (isReservedKey(key)) throw new AccessRoleError("ROLE_KEY_RESERVED", { key });
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`sln:access-role:${key}`}))`);
    const current = await tx.query.accessRoles.findFirst({ where: eq(accessRoles.key, key) });
    if (!current) throw new AccessRoleError("ROLE_NOT_FOUND", { key });
    const assigned = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(eq(user.accessRoleKey, key));
    const memberCount = assigned[0]?.count ?? 0;
    if (memberCount > 0) throw new AccessRoleError("ROLE_IN_USE", { key, memberCount });
    await tx.insert(auditLogs).values({
      actorId,
      action: "access_role.deleted",
      resourceType: "access_role",
      resourceId: key,
      beforeState: current,
    });
    await tx.delete(accessRoles).where(eq(accessRoles.key, key));
    return { key };
  });
}
