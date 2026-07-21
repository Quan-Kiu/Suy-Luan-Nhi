import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { createBadge, createBadgeSchema, listBadges } from "@/modules/admin/badge-admin";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  return apiJson(await listBadges());
}

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const parsed = createBadgeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiJson({ message: parsed.error.issues[0]?.message }, { status: 400 });
  const result = await createBadge(authResult.session.user.id, parsed.data);
  if ("error" in result) {
    if (result.error === "slug_conflict")
      return apiJson({ message: "Mã huy hiệu đã được sử dụng" }, { status: 409 });
    if (result.error === "icon_not_image")
      return apiJson({ message: "Tệp huy hiệu phải là hình ảnh" }, { status: 400 });
    return apiJson({ message: "Ảnh huy hiệu chưa có trong thư viện tư liệu" }, { status: 400 });
  }
  invalidateTaxonomyCaches();
  return apiJson(result.badge, { status: 201 });
}
