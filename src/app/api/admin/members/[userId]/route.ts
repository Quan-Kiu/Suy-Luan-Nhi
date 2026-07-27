import { z } from "zod";
import { accessRoleKeySchema } from "@/domain/access-roles";
import { AccessRoleError } from "@/modules/admin/access-roles";
import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { invalidateAdminMemberViews } from "@/lib/cache/invalidation";
import { MemberPolicyError } from "@/modules/admin/member-policy";
import { trashMember, updateMember } from "@/modules/admin/operations";

const updateSchema = z.object({
  roleKey: accessRoleKeySchema.optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(500).nullable().optional(),
});

const trashSchema = z.object({ reason: z.string().trim().max(500).optional() });

function memberPolicyResponse(error: unknown) {
  if (error instanceof MemberPolicyError || error instanceof AccessRoleError) {
    return apiJson({ code: error.code, message: error.message }, { status: 409 });
  }
  throw error;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authResult = await requireApiPermission(request, "members.manage");
  if ("error" in authResult) return authResult.error;
  const input = updateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { userId } = await params;
  try {
    const result = await updateMember(authResult.session.user.id, userId, input.data);
    if (result) invalidateAdminMemberViews();
    return result ? apiJson(result) : apiJson({ message: "Không tìm thấy thành viên" }, { status: 404 });
  } catch (error) {
    return memberPolicyResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authResult = await requireApiPermission(request, "members.manage");
  if ("error" in authResult) return authResult.error;
  const input = trashSchema.safeParse(await request.json().catch(() => ({})));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { userId } = await params;
  try {
    const result = await trashMember(authResult.session.user.id, userId, input.data.reason);
    if (result) invalidateAdminMemberViews();
    return result ? apiJson(result) : apiJson({ message: "Không tìm thấy thành viên" }, { status: 404 });
  } catch (error) {
    return memberPolicyResponse(error);
  }
}
