import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { hasParentGate } from "@/modules/family/parent-gate";

export async function requireParentWorkspace() {
  const session = await requireParent();
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  if (!parent.pinHash || !(await hasParentGate(parent.id, parent.pinHash))) redirect("/parent?locked=1");
  return { session, parent };
}
