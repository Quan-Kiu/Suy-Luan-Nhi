import { redirect } from "next/navigation";
import { requirePermission } from "@/auth/session";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { grantAdminParentGate } from "@/modules/family/parent-gate";

export async function GET() {
  const session = await requirePermission("parent_access.use");
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);

  await grantAdminParentGate(parent.id, session.session.token);
  redirect("/parent");
}
