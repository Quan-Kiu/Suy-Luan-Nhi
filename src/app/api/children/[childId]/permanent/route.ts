import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { permanentlyDeleteChild } from "@/modules/family/family";

export async function DELETE(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  const deleted = await permanentlyDeleteChild(authResult.session.user.id, childId);
  if (!deleted) return apiJson({ message: "Không tìm thấy hồ sơ đã xóa" }, { status: 404 });
  const cookieStore = await cookies();
  if (cookieStore.get("sln_active_child")?.value === childId) cookieStore.delete("sln_active_child");
  revalidatePath("/profiles");
  revalidatePath("/onboarding");
  revalidatePath("/parent");
  revalidatePath("/missions");
  return apiJson({ deleted: true, childId });
}
