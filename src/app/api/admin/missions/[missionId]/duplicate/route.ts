import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { duplicateAdminMission } from "@/modules/admin/mission-admin";
export async function POST(request: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { missionId } = await params;
  const mission = await duplicateAdminMission(missionId, authResult.session.user.id);
  return mission
    ? apiJson(mission, { status: 201 })
    : apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
}
