import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { restoreMissionVersion } from "@/modules/admin/mission-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { missionId, versionId } = await params;
  const result = await restoreMissionVersion(missionId, versionId, authResult.session.user.id);
  if (!("error" in result)) return apiJson(result);
  if (result.error === "not_found") {
    return apiJson({ message: "Không tìm thấy phiên bản cần khôi phục" }, { status: 404 });
  }
  if (result.error === "taxonomy_missing") {
    return apiJson({ message: "Phiên bản dùng nhóm kỹ năng hoặc chủ đề không còn tồn tại" }, { status: 409 });
  }
  return apiJson({ message: "Phiên bản cũ không còn tương thích để khôi phục" }, { status: 422 });
}
