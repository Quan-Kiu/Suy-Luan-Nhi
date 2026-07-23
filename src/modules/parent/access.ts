import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { resolveParentWorkspaceAccess } from "@/modules/parent/access-policy";
import { getOrCreateParentProfile } from "@/modules/family/family";

export async function requireParentWorkspace() {
  const session = await requireParent();
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  const access = await resolveParentWorkspaceAccess({
    role: session.user.role,
    parentProfileId: parent.id,
    pinHash: parent.pinHash,
    sessionToken: session.session.token,
  });
  if (!access.granted) redirect("/parent?locked=1");
  return { session, parent, access };
}
