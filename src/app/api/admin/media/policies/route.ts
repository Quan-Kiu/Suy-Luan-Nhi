import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { getImageUploadPolicies } from "@/modules/media/upload-policy";

export async function GET(request: Request) {
  const authResult = await requireApiRoles(request, ["content_admin", "reviewer", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  return apiJson(await getImageUploadPolicies());
}
