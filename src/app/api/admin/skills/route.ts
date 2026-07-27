import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { z } from "zod";
import { requireApiPermission } from "@/auth/api";
import { createSkill } from "@/modules/admin/operations";
const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  description: z.string().min(8),
  category: z.string().min(2),
});
export async function POST(request: Request) {
  const authResult = await requireApiPermission(request, "taxonomy.manage");
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const skill = await createSkill(authResult.session.user.id, input.data);
  invalidateTaxonomyCaches();
  return apiJson(skill, { status: 201 });
}
