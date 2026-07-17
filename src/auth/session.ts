import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { hasRole, type AppRole } from "@/auth/roles";
import { isDatabaseUnavailable } from "@/lib/infrastructure";

export const getServerSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export async function requireSession() {
  let session;
  try {
    session = await getServerSession();
  } catch (error) {
    if (isDatabaseUnavailable(error)) redirect("/service-unavailable?service=database");
    throw error;
  }
  if (!session) redirect("/auth/sign-in");
  return session;
}

export async function requireRoles(roles: readonly AppRole[]) {
  const session = await requireSession();
  if (!hasRole(session.user.role, roles)) redirect("/auth/error?reason=forbidden");
  return session;
}

export async function requireParent() {
  return requireRoles(["parent", "super_admin"]);
}

export async function requireStaff() {
  return requireRoles(["content_admin", "reviewer", "super_admin"]);
}
