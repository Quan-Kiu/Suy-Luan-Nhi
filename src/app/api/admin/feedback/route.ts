import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { systemFeedbackStatuses, type SystemFeedbackStatus } from "@/domain/system-feedback";
import { listSystemFeedback } from "@/modules/system-feedback/system-feedback";

export async function GET(request: Request) {
  const authResult = await requireApiPermission(request, "feedback.view");
  if ("error" in authResult) return authResult.error;
  const params = new URL(request.url).searchParams;
  const rawStatus = params.get("status");
  const status = systemFeedbackStatuses.includes(rawStatus as SystemFeedbackStatus)
    ? (rawStatus as SystemFeedbackStatus)
    : undefined;
  return apiJson(
    await listSystemFeedback({
      status,
      page: Number(params.get("page") || 1),
      pageSize: Number(params.get("pageSize") || 50),
    }),
  );
}
