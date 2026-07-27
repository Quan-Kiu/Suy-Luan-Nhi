import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { z } from "zod";
import { requireApiPermission } from "@/auth/api";
import { isAgeGroup } from "@/domain/age-groups";
import { updateAgeGroup } from "@/modules/admin/operations";
const schema = z.object({
  label: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  minAge: z.number().int().min(1).optional(),
  maxAge: z.number().int().max(18).optional(),
  sortOrder: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});
export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const authResult = await requireApiPermission(request, "taxonomy.manage");
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { code } = await params;
  if (!isAgeGroup(code)) return apiJson({ message: "Nhóm tuổi không hợp lệ" }, { status: 400 });
  const result = await updateAgeGroup(authResult.session.user.id, code, input.data);
  if (!result) return apiJson({ message: "Không tìm thấy nhóm tuổi" }, { status: 404 });
  invalidateTaxonomyCaches();
  return apiJson(result);
}
