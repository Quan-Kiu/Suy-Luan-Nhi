import { revalidatePath } from "next/cache";
import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { ChildProfileLimitError, restoreChild } from "@/modules/family/family";

export async function POST(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  try {
    const child = await restoreChild(authResult.session.user.id, childId);
    if (!child) return apiJson({ message: "Không tìm thấy hồ sơ đã xóa" }, { status: 404 });
    revalidatePath("/profiles");
    revalidatePath("/onboarding");
    revalidatePath("/parent");
    revalidatePath("/missions");
    return apiJson(child);
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
