import { apiJson } from "@/lib/api-response";
import { requireApiRoles } from "@/auth/api";
import { getOwnedChild, softDeleteChild, updateChild } from "@/modules/family/family";
import { updateChildSchema } from "@/modules/family/schemas";

export async function GET(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  const result = await getOwnedChild(authResult.session.user.id, childId);
  return result ? apiJson(result.child) : apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const input = updateChildSchema.safeParse(await request.json().catch(() => null));
  if (!input.success)
    return apiJson(
      { message: input.error.issues[0]?.message, issues: input.error.flatten() },
      { status: 400 },
    );
  const { childId } = await params;
  const child = await updateChild(authResult.session.user.id, childId, input.data);
  return child ? apiJson(child) : apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  return (await softDeleteChild(authResult.session.user.id, childId))
    ? apiJson({ deleted: true, resource: "child_profile" })
    : apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
}
