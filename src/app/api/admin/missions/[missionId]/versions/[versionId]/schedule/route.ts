import { apiJson } from "@/lib/api-response";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { scheduleMissionVersion } from "@/modules/admin/mission-admin";
const schema = z.object({ scheduledFor: z.string().datetime() });
export async function POST(
  request: Request,
  { params }: { params: Promise<{ missionId: string; versionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["reviewer", "super_admin"]);
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
  return result
    ? apiJson(result)
    : apiJson(
        { message: "Chỉ phiên bản approved và thời gian tương lai mới được lên lịch" },
        { status: 409 },
      );
}
