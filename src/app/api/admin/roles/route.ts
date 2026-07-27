import { requireApiPermission } from "@/auth/api";
import { createAccessRoleSchema } from "@/domain/access-roles";
import { apiJson } from "@/lib/api-response";
import { invalidateAdminMemberViews } from "@/lib/cache/invalidation";
import { AccessRoleError, createAccessRole } from "@/modules/admin/access-roles";

function accessRoleErrorResponse(error: unknown) {
  if (error instanceof AccessRoleError) {
    return apiJson({ code: error.code, message: error.message, ...error.metadata }, { status: 409 });
  }
  throw error;
}

export async function POST(request: Request) {
  const authResult = await requireApiPermission(request, "roles.manage");
  if ("error" in authResult) return authResult.error;
  const input = createAccessRoleSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  try {
    const created = await createAccessRole(authResult.session.user.id, input.data);
    invalidateAdminMemberViews();
    return apiJson(created, { status: 201 });
  } catch (error) {
    return accessRoleErrorResponse(error);
  }
}
