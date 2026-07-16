import { apiJson } from "@/lib/api-response";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { updateMember } from "@/modules/admin/operations";
const schema = z.object({
  role: z.enum(["parent", "content_admin", "reviewer", "super_admin"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(500).nullable().optional(),
});
export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authResult = await requireApiRoles(request, ["super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { userId } = await params;
  if (userId === authResult.session.user.id && input.data.banned)
    return apiJson({ message: "Không thể tự khóa tài khoản hiện tại" }, { status: 409 });
  const result = await updateMember(authResult.session.user.id, userId, input.data);
  return result ? apiJson(result) : apiJson({ message: "Không tìm thấy thành viên" }, { status: 404 });
}
