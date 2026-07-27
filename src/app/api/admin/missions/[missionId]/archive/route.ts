import { apiJson } from "@/lib/api-response";
import { invalidateAdminMissionViews, invalidatePublishedCatalog } from "@/lib/cache/invalidation";
import { requireApiPermission } from "@/auth/api";
import { archiveMission } from "@/modules/admin/mission-admin";
export async function POST(request: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const authResult = await requireApiPermission(request, "missions.manage");
  if ("error" in authResult) return authResult.error;
  const { missionId } = await params;
  const mission = await archiveMission(missionId, authResult.session.user.id);
  if (!mission) return apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
  invalidatePublishedCatalog();
  invalidateAdminMissionViews(missionId);
  return apiJson(mission);
}
