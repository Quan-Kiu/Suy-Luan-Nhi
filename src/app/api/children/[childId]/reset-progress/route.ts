import { apiJson } from "@/lib/api-response";
import { requireApiParentGate } from "@/auth/api";
import { invalidateParentDashboard } from "@/lib/cache/invalidation";
import { resetChildProgress } from "@/modules/family/family";
export async function POST(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  const reset = await resetChildProgress(authResult.session.user.id, childId);
  if (!reset) return apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
  invalidateParentDashboard(childId);
  return apiJson({ ok: true });
}
