import { hasRole, staffRoles } from "@/auth/roles";

export type AuthAccessUser = {
  role?: unknown;
  banned?: boolean | null;
  banExpires?: Date | string | null;
  twoFactorEnabled?: boolean | null;
  deletedAt?: Date | string | null;
};
export type AuthAccessSession = {
  mfaVerifiedAt?: Date | string | null;
};

export function isDeletedAccount(user: AuthAccessUser) {
  return Boolean(user.deletedAt);
}

export function isActiveBan(user: AuthAccessUser, now = new Date()) {
  if (!user.banned) return false;
  if (!user.banExpires) return true;
  const expiresAt = user.banExpires instanceof Date ? user.banExpires : new Date(user.banExpires);
  return Number.isNaN(expiresAt.getTime()) || expiresAt > now;
}

export function isStaffAccount(user: AuthAccessUser) {
  return hasRole(user.role, staffRoles);
}

export function requiresStaffMfa(user: AuthAccessUser) {
  return isStaffAccount(user) && user.twoFactorEnabled !== true;
}

export function requiresStaffMfaChallenge(user: AuthAccessUser, session: AuthAccessSession) {
  return isStaffAccount(user) && user.twoFactorEnabled === true && !session.mfaVerifiedAt;
}
