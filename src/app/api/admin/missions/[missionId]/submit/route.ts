import { apiJson } from "@/lib/api-response";
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
            : "Không tìm thấy nhiệm vụ",
      },
      { status: result.error === "safety_incomplete" ? 422 : 404 },
    );
  return apiJson(result);
}
