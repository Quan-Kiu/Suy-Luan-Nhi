import { apiJson } from "@/lib/api-response";
import { invalidateAdminMissionViews } from "@/lib/cache/invalidation";
import { requireApiRoles } from "@/auth/api";
import { submitMissionForReview } from "@/modules/admin/mission-admin";
export async function POST(request: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { missionId } = await params;
  const result = await submitMissionForReview(missionId, authResult.session.user.id);
  if ("error" in result)
    return apiJson(
      {
        message:
          result.error === "safety_incomplete"
            ? "Checklist an toàn chưa hoàn tất"
            : result.error === "template_variables_invalid"
              ? "Nội dung đang dùng tag chưa được Super Admin bật hoặc không tồn tại"
              : "Không tìm thấy nhiệm vụ",
        ...(result.error === "template_variables_invalid" ? { issues: result.issues } : {}),
      },
      {
        status:
          result.error === "safety_incomplete" || result.error === "template_variables_invalid" ? 422 : 404,
      },
    );
  invalidateAdminMissionViews(missionId);
  return apiJson(result);
}
