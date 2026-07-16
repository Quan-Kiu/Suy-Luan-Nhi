import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { markNotificationRead } from "@/modules/parent/parent-data";
export async function POST(request: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const parent = await getOrCreateParentProfile(authResult.session.user.id, authResult.session.user.name);
  const { notificationId } = await params;
  await markNotificationRead(parent.id, notificationId);
  return apiJson({ ok: true });
}
