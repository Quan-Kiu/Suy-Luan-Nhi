import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { getSessionView } from "@/modules/gameplay/session";
export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { sessionId } = await params;
  const result = await getSessionView(authResult.session.user.id, sessionId);
  return "error" in result
    ? apiJson({ message: "Không tìm thấy phiên nhiệm vụ" }, { status: 404 })
    : apiJson(result);
}
