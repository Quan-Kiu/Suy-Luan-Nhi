import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { reviewRejectionSchema } from "@/modules/admin/schemas";
import { rejectMissionVersion } from "@/modules/admin/mission-admin";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = reviewRejectionSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { missionId, versionId } = await params;
  const version = await rejectMissionVersion(
    missionId,
    versionId,
    authResult.session.user.id,
    input.data.comment,
  );
  return version ? apiJson(version) : apiJson({ message: "Phiên bản không còn chờ duyệt" }, { status: 409 });
}
