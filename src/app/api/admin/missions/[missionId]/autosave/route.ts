import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { autosaveAdminMission, MissionDraftConflictError } from "@/modules/admin/mission-admin";
import {
  missionTemplateIssueMessage,
  validateMissionTemplateVariables,
} from "@/modules/admin/mission-template-variables";
import { adminMissionDraftSchema } from "@/modules/admin/schemas";

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

  const { missionId } = await params;
  try {
    const mission = await autosaveAdminMission(
      missionId,
      input.data,
      authResult.session.user.id,
      request.headers.has("x-mission-draft-version")
        ? Number(request.headers.get("x-mission-draft-version"))
        : undefined,
    );
    if (!mission) return apiJson({ message: "Không tìm thấy nhiệm vụ" }, { status: 404 });
    return apiJson({
      id: mission.id,
      status: mission.status,
      currentDraftVersion: mission.currentDraftVersion,
      updatedAt: mission.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof MissionDraftConflictError) {
      return apiJson(
        {
          message: "Bản nháp đã được thay đổi ở nơi khác. Hãy tải lại trang trước khi tiếp tục.",
          currentDraftVersion: error.currentDraftVersion,
          currentUpdatedAt: error.currentUpdatedAt.toISOString(),
        },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message.includes("unique")) {
      return apiJson({ message: "Slug nhiệm vụ đã tồn tại" }, { status: 409 });
    }
    throw error;
  }
}
