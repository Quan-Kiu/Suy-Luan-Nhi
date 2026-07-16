import { apiJson } from "@/lib/api-response";
import { requireApiParentGate } from "@/auth/api";
import { createExportRequest } from "@/modules/family/family";

export async function POST(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  return apiJson(await createExportRequest(authResult.session.user.id, authResult.session.user.name), {
    status: 201,
  });
}
