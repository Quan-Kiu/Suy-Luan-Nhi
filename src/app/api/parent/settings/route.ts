import { apiJson } from "@/lib/api-response";
import { requireApiParentGate } from "@/auth/api";
import { updateParentSettings } from "@/modules/family/family";
import { grantParentGate } from "@/modules/family/parent-gate";
import { updateParentSettingsSchema } from "@/modules/family/schemas";
export async function PATCH(request: Request) {
  const authResult = await requireApiParentGate(request);
  if ("error" in authResult) return authResult.error;
  const input = updateParentSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!input.success)
    return apiJson(
      { message: input.error.issues[0]?.message, issues: input.error.flatten() },
      { status: 400 },
    );
  const updated = await updateParentSettings(
    authResult.session.user.id,
    authResult.session.user.name,
    input.data,
  );
  if (input.data.pin && updated.pinHash) await grantParentGate(updated.id, updated.pinHash);
  return apiJson({ updated: true });
}
