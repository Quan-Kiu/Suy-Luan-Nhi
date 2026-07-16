import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { completeMission } from "@/modules/gameplay/session";
export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { sessionId } = await params;
  const result = await completeMission(authResult.session.user.id, sessionId);
  if ("error" in result)
    return apiJson(
      {
        message:
          result.error === "not_complete"
            ? "Hãy hoàn thành tất cả câu hỏi trước"
            : "Không thể hoàn thành nhiệm vụ",
      },
      { status: result.error === "not_complete" ? 409 : 404 },
    );
  return apiJson(result);
}
