import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { updateBadge, updateBadgeSchema } from "@/modules/admin/badge-admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ badgeId: string }> }) {
  const authResult = await requireApiPermission(request, "badges.manage");
  if ("error" in authResult) return authResult.error;
  const parsed = updateBadgeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiJson({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const { badgeId } = await params;
  const result = await updateBadge(authResult.session.user.id, badgeId, parsed.data);
  if ("error" in result) {
    if (result.error === "not_found") return apiJson({ message: "Không tìm thấy huy hiệu" }, { status: 404 });
    if (result.error === "icon_not_image")
      return apiJson({ message: "Tệp huy hiệu phải là hình ảnh" }, { status: 400 });
    return apiJson({ message: "Ảnh huy hiệu chưa có trong thư viện tư liệu" }, { status: 400 });
  }
  invalidateTaxonomyCaches();
  return apiJson(result.badge);
}
