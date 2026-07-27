import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { invalidateAdminMemberViews } from "@/lib/cache/invalidation";
import { MemberPolicyError } from "@/modules/admin/member-policy";
import { restoreMember } from "@/modules/admin/operations";

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authResult = await requireApiPermission(request, "members.manage");
  if ("error" in authResult) return authResult.error;
  const { userId } = await params;
  try {
    const result = await restoreMember(authResult.session.user.id, userId);
    if (result) invalidateAdminMemberViews();
    return result ? apiJson(result) : apiJson({ message: "Không tìm thấy thành viên" }, { status: 404 });
  } catch (error) {
    if (error instanceof MemberPolicyError) {
      return apiJson({ code: error.code, message: error.message }, { status: 409 });
    }
    throw error;
  }
}
