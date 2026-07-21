import { revalidatePath } from "next/cache";
import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { ChildProfileLimitError, createChild, listChildren } from "@/modules/family/family";
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
  try {
    const child = await createChild(authResult.session.user.id, authResult.session.user.name, input.data);
    revalidatePath("/profiles");
    revalidatePath("/onboarding");
    return apiJson(child, { status: 201 });
  } catch (error) {
    if (error instanceof ChildProfileLimitError) {
      return apiJson(
        { code: "CHILD_PROFILE_LIMIT_REACHED", message: error.message, limit: error.limit },
        { status: 409 },
      );
    }
    throw error;
  }
}
