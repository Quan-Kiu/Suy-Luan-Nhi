import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { listSelectableChildAvatars } from "@/modules/family/child-avatars";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  return apiJson(await listSelectableChildAvatars());
}
