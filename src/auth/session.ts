import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isActiveBan, requiresStaffMfa, requiresStaffMfaChallenge } from "@/auth/access-policy";
import { auth } from "@/auth/auth";
import { hasRole, type AppRole } from "@/auth/roles";
import { env } from "@/config/env";
import { isDatabaseUnavailable } from "@/lib/infrastructure";

const getServerSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireSession() {
  let session;
  try {
    session = await getServerSession();
  } catch (error) {
    if (isDatabaseUnavailable(error)) redirect("/service-unavailable?service=database");
    throw error;
  }
  if (!session) redirect("/auth/sign-in");
  if (isActiveBan(session.user)) redirect("/auth/error?reason=banned");
  if (session.user.mustChangePassword) redirect("/auth/change-temporary-password");
  return session;
}

export async function requireRoles(roles: readonly AppRole[]) {
  const session = await requireSession();
  if (!hasRole(session.user.role, roles)) redirect("/auth/error?reason=forbidden");
  if (env.AUTH_STAFF_MFA_REQUIRED && requiresStaffMfa(session.user)) redirect("/auth/mfa/setup");
  if (env.AUTH_STAFF_MFA_REQUIRED && requiresStaffMfaChallenge(session.user, session.session)) {
    redirect("/auth/two-factor");
  }
  return session;
}

export async function requireParent() {
  return requireRoles(["parent", "super_admin"]);
}

export async function requireStaff() {
  return requireRoles(["content_admin", "reviewer", "super_admin"]);
}
