import { apiJson } from "@/lib/api-response";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { updateWorld } from "@/modules/admin/operations";
const schema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().min(2).optional(),
  description: z.string().min(8).optional(),
  sortOrder: z.number().int().positive().optional(),
  themeColor: z.string().min(3).optional(),
  coverUrl: z.string().min(1).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});
export async function PATCH(request: Request, { params }: { params: Promise<{ worldId: string }> }) {
  const authResult = await requireApiRoles(request, ["content_admin", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  const { worldId } = await params;
  const result = await updateWorld(authResult.session.user.id, worldId, input.data);
  return result ? apiJson(result) : apiJson({ message: "Không tìm thấy thế giới" }, { status: 404 });
}
