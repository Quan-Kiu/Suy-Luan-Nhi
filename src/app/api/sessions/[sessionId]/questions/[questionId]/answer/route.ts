import { apiJson } from "@/lib/api-response";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { submitAnswer } from "@/modules/gameplay/session";
const answerSchema = z.object({
  submission: z.union([z.string(), z.array(z.string()), z.record(z.string(), z.string())]),
  responseTimeMs: z.number().int().min(0).max(3_600_000),
  idempotencyKey: z.string().min(8).max(100),
});
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; questionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = answerSchema.safeParse(await request.json().catch(() => null));
  if (!input.success)
    return apiJson(
      { message: input.error.issues[0]?.message, issues: input.error.flatten() },
      { status: 400 },
    );
  const { sessionId, questionId } = await params;
  const result = await submitAnswer({
    userId: authResult.session.user.id,
    sessionId,
    questionId,
    ...input.data,
  });
  if ("error" in result)
    return apiJson(
      {
        message:
          result.error === "question_not_current"
            ? "Câu hỏi này không còn là câu hiện tại"
            : "Không thể ghi nhận đáp án",
      },
      { status: result.error === "question_not_current" ? 409 : 404 },
    );
  return apiJson(result);
}
