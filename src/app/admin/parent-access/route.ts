import { redirect } from "next/navigation";
import { requireRoles } from "@/auth/session";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { grantAdminParentGate } from "@/modules/family/parent-gate";

export async function GET() {
  const session = await requireRoles(["super_admin"]);
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);

  await grantAdminParentGate(parent.id, session.session.token);
  redirect("/parent");
}
