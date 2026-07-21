import { apiJson } from "@/lib/api-response";
import { invalidateTaxonomyCaches } from "@/lib/cache/invalidation";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { createWorld } from "@/modules/admin/operations";
const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(2),
  subtitle: z.string().min(2),
  description: z.string().min(8),
  sortOrder: z.number().int().positive(),
  themeColor: z.string().min(3),
  coverUrl: z.string().min(1),
});
export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const world = await createWorld(authResult.session.user.id, input.data);
  invalidateTaxonomyCaches();
  return apiJson(world, { status: 201 });
}
