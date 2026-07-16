import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { requestHint } from "@/modules/gameplay/session";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string; questionId: string }> },
) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { sessionId, questionId } = await params;
  const result = await requestHint(authResult.session.user.id, sessionId, questionId);
  return "error" in result ? apiJson({ message: "Không thể lấy gợi ý" }, { status: 404 }) : apiJson(result);
}
