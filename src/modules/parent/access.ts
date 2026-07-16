import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { hasParentGate } from "@/modules/family/parent-gate";

export async function requireParentWorkspace() {
  const session = await requireParent();
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  if (!(await hasParentGate(parent.id))) redirect("/parent?locked=1");
  return { session, parent };
}
