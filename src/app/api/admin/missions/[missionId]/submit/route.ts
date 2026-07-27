import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { invalidateAdminMissionViews } from "@/lib/cache/invalidation";
import { submitMissionForReview } from "@/modules/admin/mission-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string }> },
): Promise<Response> {
  const authResult = await requireApiPermission(request, "missions.manage");
  if ("error" in authResult) {
    return (
      authResult.error ??
      apiJson(
        { code: "AUTHORIZATION_FAILED", message: "Không thể xác minh quyền thực hiện thao tác." },
        { status: 500 },
      )
    );
  }

  const { missionId } = await params;
  const result = await submitMissionForReview(missionId, authResult.session.user.id);

  if ("error" in result) {
    switch (result.error) {
      case "safety_incomplete":
        return apiJson(
          {
            code: "MISSION_SAFETY_INCOMPLETE",
            message: "Checklist an toàn chưa hoàn tất",
          },
          { status: 422 },
        );
      case "template_variables_invalid":
        return apiJson(
          {
            code: "MISSION_TEMPLATE_VARIABLES_INVALID",
            message: "Nội dung đang dùng tag chưa được Super Admin bật hoặc không tồn tại",
            issues: result.issues,
          },
          { status: 422 },
        );
      case "media_unapproved":
        return apiJson(
          {
            code: "MISSION_MEDIA_REVIEW_REQUIRED",
            message:
              "Nhiệm vụ đang dùng tư liệu chưa được kiểm tra. Hãy nhờ người kiểm duyệt đánh dấu phù hợp trong mục Thư viện rồi gửi lại.",
            media: result.media,
          },
          { status: 422 },
        );
      case "not_found":
        return apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
    }

    return apiJson(
      {
        code: "MISSION_SUBMIT_FAILED",
        message: "Không thể gửi nhiệm vụ để kiểm tra. Hãy thử lại.",
      },
      { status: 500 },
    );
  }

  invalidateAdminMissionViews(missionId);
  return apiJson(result);
}
