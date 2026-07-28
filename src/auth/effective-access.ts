import "server-only";
import { eq } from "drizzle-orm";
import { roleDefinitions, rolePermissionMap, type PermissionKey } from "@/auth/permissions";
import { parseRoles, systemRoleSchema } from "@/auth/roles";
import { db } from "@/db/client";
import { accessRoles } from "@/db/schema";

export type AccessIdentity = {
  id: string;
  role?: unknown;
  accessRoleKey?: string | null;
};

export type EffectiveAccess = {
  roleKey: string;
  roleLabel: string;
  permissions: PermissionKey[];
  custom: boolean;
};

export async function resolveEffectiveAccess(identity: AccessIdentity): Promise<EffectiveAccess> {
  const roles = parseRoles(identity.role);
  const systemRole = roles.find((role) => systemRoleSchema.safeParse(role).success);
  if (systemRole && systemRoleSchema.safeParse(systemRole).success) {
    const key = systemRoleSchema.parse(systemRole);
    return {
      roleKey: key,
      roleLabel: roleDefinitions[key].label,
      permissions: [...rolePermissionMap[key]],
      custom: false,
    };
  }
  if (roles.includes("custom_staff") && identity.accessRoleKey) {
    const role = await db.query.accessRoles.findFirst({ where: eq(accessRoles.key, identity.accessRoleKey) });
    if (role) {
      return {
        roleKey: role.key,
        roleLabel: role.name,
        permissions: role.permissions as PermissionKey[],
        custom: true,
      };
    }
  }
  return { roleKey: "invalid", roleLabel: "Vai trò không hợp lệ", permissions: [], custom: false };
}

export async function hasEffectivePermission(identity: AccessIdentity, permission: PermissionKey) {
  const access = await resolveEffectiveAccess(identity);
  return access.permissions.includes(permission);
}
