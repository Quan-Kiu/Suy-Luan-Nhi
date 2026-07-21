import { apiJson } from "@/lib/api-response";
import { invalidateAdminMissionViews } from "@/lib/cache/invalidation";
import { requireApiRoles } from "@/auth/api";
import { adminMissionDraftSchema } from "@/modules/admin/schemas";
import {
  missionTemplateIssueMessage,
  validateMissionTemplateVariables,
} from "@/modules/admin/mission-template-variables";
import { createAdminMission, listAdminMissions } from "@/modules/admin/mission-admin";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const url = new URL(request.url);
  return apiJson(
    await listAdminMissions({
      status: url.searchParams.get("status") ?? undefined,
      worldId: url.searchParams.get("worldId") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      page: Number(url.searchParams.get("page") || 1),
      pageSize: Number(url.searchParams.get("pageSize") || 10),
    }),
  );
}

export async function POST(request: Request) {
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
  try {
    const mission = await createAdminMission(input.data, authResult.session.user.id);
    invalidateAdminMissionViews(mission.id);
    return apiJson(mission, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return apiJson({ message: "Slug nhiệm vụ đã tồn tại" }, { status: 409 });
    }
    throw error;
  }
}
