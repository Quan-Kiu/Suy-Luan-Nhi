import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { exitMission } from "@/modules/gameplay/session";
export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { sessionId } = await params;
  return (await exitMission(authResult.session.user.id, sessionId))
    ? apiJson({ ok: true })
    : apiJson({ message: "Không tìm thấy phiên nhiệm vụ" }, { status: 404 });
}
