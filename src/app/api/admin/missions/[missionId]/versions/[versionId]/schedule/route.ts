import { apiJson } from "@/lib/api-response";
import { invalidateAdminMissionViews } from "@/lib/cache/invalidation";
import { z } from "zod";
import { requireApiPermission } from "@/auth/api";
import { scheduleMissionVersion } from "@/modules/admin/mission-admin";
const schema = z.object({ scheduledFor: z.string().datetime() });
export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiPermission(request, "missions.review");
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: "Thời gian xuất bản chưa hợp lệ" }, { status: 400 });
  const { missionId, versionId } = await params;
  const result = await scheduleMissionVersion(
    missionId,
    versionId,
    authResult.session.user.id,
    new Date(input.data.scheduledFor),
  );
  if ("error" in result) {
    const message =
      result.error === "invalid_schedule"
        ? "Thời gian hiển thị phải ở tương lai"
        : result.error === "world_not_published"
          ? "Hãy bật hiển thị chủ đề nhiệm vụ trước khi lên lịch"
          : result.error === "world_age_groups_incomplete"
            ? `Chủ đề chưa bật nhóm tuổi: ${result.missingAgeGroups.join(", ")}`
            : result.error === "invalid_snapshot"
              ? "Phiên bản nhiệm vụ không hợp lệ; hãy gửi duyệt lại"
              : "Chỉ phiên bản đã duyệt mới được lên lịch";
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
  invalidateAdminMissionViews(missionId);
  return apiJson(result.mission);
}
