import { requireApiPermission } from "@/auth/api";
import { updateAccessRoleSchema } from "@/domain/access-roles";
import { apiJson } from "@/lib/api-response";
import { invalidateAdminMemberViews } from "@/lib/cache/invalidation";
import { AccessRoleError, deleteAccessRole, updateAccessRole } from "@/modules/admin/access-roles";

function accessRoleErrorResponse(error: unknown) {
  if (error instanceof AccessRoleError) {
    const status = error.code === "ROLE_NOT_FOUND" ? 404 : 409;
    return apiJson({ code: error.code, message: error.message, ...error.metadata }, { status });
  }
  throw error;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ roleKey: string }> }) {
  const authResult = await requireApiPermission(request, "roles.manage");
  if ("error" in authResult) return authResult.error;
  const input = updateAccessRoleSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { roleKey } = await params;
  try {
    const updated = await updateAccessRole(authResult.session.user.id, roleKey, input.data);
    invalidateAdminMemberViews();
    return apiJson(updated);
  } catch (error) {
    return accessRoleErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ roleKey: string }> }) {
  const authResult = await requireApiPermission(request, "roles.manage");
  if ("error" in authResult) return authResult.error;
  const { roleKey } = await params;
  try {
    const deleted = await deleteAccessRole(authResult.session.user.id, roleKey);
    invalidateAdminMemberViews();
    return apiJson(deleted);
  } catch (error) {
    return accessRoleErrorResponse(error);
  }
}
