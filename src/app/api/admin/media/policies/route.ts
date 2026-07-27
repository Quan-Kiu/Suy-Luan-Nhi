import { requireApiPermission } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { getImageUploadPolicies } from "@/modules/media/upload-policy";

export async function GET(request: Request) {
  const authResult = await requireApiPermission(request, "media.view");
  if ("error" in authResult) return authResult.error;
  return apiJson(await getImageUploadPolicies());
}
