import { apiJson } from "@/lib/api-response";
import { requireApiParentGate } from "@/auth/api";
import { createDataRequest } from "@/modules/family/family";
export async function POST(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  return apiJson(
    await createDataRequest(authResult.session.user.id, authResult.session.user.name, "delete"),
    { status: 202 },
  );
}
