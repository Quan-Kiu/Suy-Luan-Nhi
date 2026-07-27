import { apiJson } from "@/lib/api-response";
import { requireApiPermission } from "@/auth/api";
import { invalidateParentResources } from "@/lib/cache/invalidation";
import {
  adminResourceSchema,
  archiveAdminResource,
  getAdminResource,
  updateAdminResource,
} from "@/modules/admin/resource-admin";

type Context = { params: Promise<{ resourceId: string }> };

export async function GET(request: Request, context: Context) {
  const authResult = await requireApiPermission(request, "resources.view");
  if ("error" in authResult) return authResult.error;
  const { resourceId } = await context.params;
  const resource = await getAdminResource(resourceId);
  return resource ? apiJson(resource) : apiJson({ message: "Không tìm thấy tài nguyên" }, { status: 404 });
}

export async function PATCH(request: Request, context: Context) {
  const authResult = await requireApiPermission(request, "resources.manage");
  if ("error" in authResult) return authResult.error;
  const input = adminResourceSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return apiJson(
      { message: input.error.issues[0]?.message ?? "Tài nguyên chưa hợp lệ", issues: input.error.flatten() },
      { status: 400 },
    );
  }
  const { resourceId } = await context.params;
  try {
    const resource = await updateAdminResource(resourceId, input.data, authResult.session.user.id);
    if (!resource) return apiJson({ message: "Không tìm thấy tài nguyên" }, { status: 404 });
    invalidateParentResources();
    return apiJson(resource);
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return apiJson({ message: "Mã đường dẫn tài nguyên đã tồn tại" }, { status: 409 });
    }
    throw error;
  }
}

export async function DELETE(request: Request, context: Context) {
  const authResult = await requireApiPermission(request, "resources.manage");
  if ("error" in authResult) return authResult.error;
  const { resourceId } = await context.params;
  const resource = await archiveAdminResource(resourceId, authResult.session.user.id);
  if (!resource) return apiJson({ message: "Không tìm thấy tài nguyên" }, { status: 404 });
  invalidateParentResources();
  return apiJson(resource);
}
