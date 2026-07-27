import { apiJson } from "@/lib/api-response";
import { invalidateAdminMissionViews } from "@/lib/cache/invalidation";
import { requireApiPermission } from "@/auth/api";
import { reviewApprovalSchema } from "@/modules/admin/schemas";
import { approveMissionVersion } from "@/modules/admin/mission-admin";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiPermission(request, "missions.review");
  if ("error" in authResult) return authResult.error;
  const input = reviewApprovalSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { missionId, versionId } = await params;
  const version = await approveMissionVersion(
    missionId,
    versionId,
    authResult.session.user.id,
    input.data.comment,
  );
  if (!version) return apiJson({ message: "Phiên bản không còn chờ duyệt" }, { status: 409 });
  invalidateAdminMissionViews(missionId);
  return apiJson(version);
}
