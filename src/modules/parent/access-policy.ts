import { hasRole } from "@/auth/roles";
import { hasAdminParentGate, hasParentGate } from "@/modules/family/parent-gate";

type ParentWorkspaceAccessInput = {
  role: unknown;
  parentProfileId: string;
  pinHash: string | null;
  sessionToken: string;
};

export type ParentWorkspaceAccess =
  { granted: true; source: "admin" | "pin" } | { granted: false; reason: "pin_not_set" | "locked" };

export async function resolveParentWorkspaceAccess({
  role,
  parentProfileId,
  pinHash,
  sessionToken,
}: ParentWorkspaceAccessInput): Promise<ParentWorkspaceAccess> {
  if (hasRole(role, ["super_admin"]) && (await hasAdminParentGate(parentProfileId, sessionToken))) {
    return { granted: true, source: "admin" };
  }
  if (!pinHash) return { granted: false, reason: "pin_not_set" };
  if (await hasParentGate(parentProfileId, pinHash)) return { granted: true, source: "pin" };
  return { granted: false, reason: "locked" };
}
