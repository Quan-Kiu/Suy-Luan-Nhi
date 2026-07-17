import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { invalidateParentDashboard } from "@/lib/cache/invalidation";
import { exitMission, getSessionCacheContext } from "@/modules/gameplay/session";
export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { sessionId } = await params;
  const cacheContext = await getSessionCacheContext(authResult.session.user.id, sessionId);
  const exited = await exitMission(authResult.session.user.id, sessionId);
  if (!exited) return apiJson({ message: "Không tìm thấy phiên nhiệm vụ" }, { status: 404 });
  if (cacheContext) invalidateParentDashboard(cacheContext.childId);
  return apiJson({ ok: true });
}
