import { apiJson } from "@/lib/api-response";
import { cookies } from "next/headers";
import { requireApiRoles } from "@/auth/api";
import { env } from "@/config/env";
import { getOwnedChild } from "@/modules/family/family";

export async function POST(request: Request, { params }: { params: Promise<{ childId: string }> }) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const { childId } = await params;
  const owned = await getOwnedChild(authResult.session.user.id, childId);
  if (!owned) return apiJson({ message: "Không tìm thấy hồ sơ bé" }, { status: 404 });
  (await cookies()).set("sln_active_child", childId, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return apiJson({ child: owned.child });
}
