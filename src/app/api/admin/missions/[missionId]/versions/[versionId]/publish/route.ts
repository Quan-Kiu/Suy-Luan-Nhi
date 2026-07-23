import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { invalidateAdminMissionViews, invalidatePublishedCatalog } from "@/lib/cache/invalidation";
import { publishMissionVersion } from "@/modules/admin/mission-admin";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { missionId, versionId } = await params;
  const result = await publishMissionVersion(missionId, versionId, authResult.session.user.id);
  if ("error" in result) {
    const message =
      result.error === "world_not_published"
        ? "Hãy bật hiển thị chủ đề nhiệm vụ trước khi cho bé xem"
        : result.error === "world_age_groups_incomplete"
          ? `Chủ đề chưa bật nhóm tuổi: ${result.missingAgeGroups.join(", ")}`
          : result.error === "invalid_snapshot"
            ? "Phiên bản nhiệm vụ không hợp lệ; hãy gửi duyệt lại"
            : "Chỉ phiên bản đã duyệt mới được xuất bản";
    return apiJson(
      {
        message,
        code: result.error,
        ...(result.error === "world_age_groups_incomplete"
          ? { missingAgeGroups: result.missingAgeGroups }
          : {}),
      },
      { status: 409 },
    );
  }
  invalidatePublishedCatalog();
  invalidateAdminMissionViews(missionId);
  return apiJson(result.version);
}
