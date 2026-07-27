import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { z } from "zod";
import { requireApiPermission } from "@/auth/api";
import { updateSkill } from "@/modules/admin/operations";
const schema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  category: z.string().min(2).optional(),
  active: z.boolean().optional(),
});
export async function PATCH(request: Request, { params }: { params: Promise<{ skillId: string }> }) {
  const authResult = await requireApiPermission(request, "taxonomy.manage");
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { skillId } = await params;
  const result = await updateSkill(authResult.session.user.id, skillId, input.data);
  if (!result) return apiJson({ message: "Không tìm thấy kỹ năng" }, { status: 404 });
  invalidateTaxonomyCaches();
  return apiJson(result);
}
