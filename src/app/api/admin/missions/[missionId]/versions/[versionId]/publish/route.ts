import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { publishMissionVersion } from "@/modules/admin/mission-admin";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { missionId, versionId } = await params;
  const version = await publishMissionVersion(missionId, versionId, authResult.session.user.id);
  return version
    ? apiJson(version)
    : apiJson({ message: "Chỉ phiên bản đã duyệt mới được xuất bản" }, { status: 409 });
}
