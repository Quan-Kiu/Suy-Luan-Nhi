import { apiJson } from "@/lib/api-response";
import { requireApiParentGate } from "@/auth/api";
import { resetChildProgress } from "@/modules/family/family";
export async function POST(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  return (await resetChildProgress(authResult.session.user.id, childId))
    ? apiJson({ ok: true })
    : apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
}
