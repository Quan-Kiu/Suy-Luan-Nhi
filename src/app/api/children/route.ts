import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { createChild, listChildren } from "@/modules/family/family";
import { createChildSchema } from "@/modules/family/schemas";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  return apiJson(await listChildren(authResult.session.user.id, authResult.session.user.name));
}

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = createChildSchema.safeParse(await request.json().catch(() => null));
  if (!input.success)
    return apiJson(
      { message: input.error.issues[0]?.message, issues: input.error.flatten() },
      { status: 400 },
    );
  const child = await createChild(authResult.session.user.id, authResult.session.user.name, input.data);
  return apiJson(child, { status: 201 });
}
