import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { updateSystemFeedbackSchema } from "@/domain/system-feedback";
import { updateSystemFeedback } from "@/modules/system-feedback/system-feedback";

export async function PATCH(request: Request, context: { params: Promise<{ feedbackId: string }> }) {
  const authResult = await requireApiPermission(request, "feedback.manage");
  if ("error" in authResult) return authResult.error;
  const parsed = updateSystemFeedbackSchema.safeParse(await request.json());
  if (!parsed.success) {
    return apiJson(
      { message: parsed.error.issues[0]?.message ?? "Thông tin xử lý chưa hợp lệ" },
      { status: 400 },
    );
  }
  const { feedbackId } = await context.params;
  const updated = await updateSystemFeedback(feedbackId, authResult.session.user.id, parsed.data);
  if (!updated) return apiJson({ message: "Không tìm thấy góp ý" }, { status: 404 });
  return apiJson(updated);
}
