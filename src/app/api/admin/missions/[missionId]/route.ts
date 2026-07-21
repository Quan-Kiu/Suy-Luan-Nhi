import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { adminMissionDraftSchema } from "@/modules/admin/schemas";
import {
  missionTemplateIssueMessage,
  validateMissionTemplateVariables,
} from "@/modules/admin/mission-template-variables";
import { getAdminMission, updateAdminMission } from "@/modules/admin/mission-admin";

export async function GET(request: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { missionId } = await params;
  const mission = await getAdminMission(missionId);
  return mission ? apiJson(mission) : apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ missionId: string }> }) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = adminMissionDraftSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return apiJson(
      { message: input.error.issues[0]?.message, issues: input.error.flatten() },
      { status: 400 },
    );
  }
  const { missionId } = await params;
  const templateValidation = await validateMissionTemplateVariables(input.data);
  if (templateValidation.issues.length) {
    return apiJson(
      {
        message: missionTemplateIssueMessage(templateValidation.issues),
        issues: templateValidation.issues,
      },
      { status: 422 },
    );
  }
  try {
    const mission = await updateAdminMission(missionId, input.data, authResult.session.user.id);
    return mission ? apiJson(mission) : apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return apiJson({ message: "Slug nhiệm vụ đã tồn tại" }, { status: 409 });
    }
    throw error;
  }
}
