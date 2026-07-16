import { apiJson } from "@/lib/api-response";
import { z } from "zod";
import { requireApiRoles } from "@/auth/api";
import { setSystemSetting } from "@/modules/admin/operations";
const schema = z.object({ key: z.string().regex(/^[a-z0-9_.-]+$/), value: z.unknown() });
export async function PATCH(request: Request) {
  const authResult = await requireApiRoles(request, ["super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return apiJson({ message: input.error.issues[0]?.message }, { status: 400 });
  return apiJson(await setSystemSetting(authResult.session.user.id, input.data.key, input.data.value));
}
