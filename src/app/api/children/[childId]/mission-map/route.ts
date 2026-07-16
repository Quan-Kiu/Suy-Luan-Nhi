import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { getMissionMap } from "@/modules/catalog/catalog";
import { getOwnedChild } from "@/modules/family/family";
export async function GET(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  const owned = await getOwnedChild(authResult.session.user.id, childId);
  if (!owned) return apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
  return apiJson(await getMissionMap(owned.child));
}
