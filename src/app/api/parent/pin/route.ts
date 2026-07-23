import { requireApiRoles } from "@/auth/api";
import { parentPinValueSchema } from "@/domain/parent-pin";
import { apiJson } from "@/lib/api-response";
import { ParentPinAlreadyConfiguredError, setupParentPin } from "@/modules/family/family";
import { grantParentGate } from "@/modules/family/parent-gate";

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;

  const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
  const parsed = parentPinValueSchema.safeParse(body?.pin);
  if (!parsed.success) {
    return apiJson({ code: "INVALID_PARENT_PIN", message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    const parent = await setupParentPin(
      authResult.session.user.id,
      authResult.session.user.name,
      parsed.data,
    );
    await grantParentGate(parent.id, parent.pinHash!);
    return apiJson({ configured: true });
  } catch (error) {
    if (error instanceof ParentPinAlreadyConfiguredError) {
      return apiJson({ code: "PARENT_PIN_ALREADY_CONFIGURED", message: error.message }, { status: 409 });
    }
    throw error;
  }
}
