import { redirect } from "next/navigation";
import { buildParentPinSetupPath, getAuthenticatedHome, resolveSafeInternalPath } from "@/auth/navigation";
import { hasRole, staffRoles } from "@/auth/roles";
import { requireSession } from "@/auth/session";
import { getOrCreateParentProfile } from "@/modules/family/family";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([requireSession(), searchParams]);
  const fallback = getAuthenticatedHome(session.user.role);
  const destination = resolveSafeInternalPath(params.next, fallback);

  if (hasRole(session.user.role, staffRoles)) redirect(destination);

  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  if (!parent.pinHash) redirect(buildParentPinSetupPath(destination));
  redirect(destination);
}
