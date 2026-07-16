import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { startMission } from "@/modules/gameplay/session";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ childId: string; missionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId, missionId } = await params;
  const result = await startMission(authResult.session.user.id, childId, missionId);
  if ("error" in result)
    return apiJson(
      { message: result.error === "locked" ? "Nhiệm vụ chưa được mở khóa" : "Không thể bắt đầu nhiệm vụ" },
      { status: result.error === "locked" ? 409 : 404 },
    );
  return apiJson(result, { status: 201 });
}
