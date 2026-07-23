import { eq } from "drizzle-orm";
import { requireApiRoles } from "@/auth/api";
import { db } from "@/db/client";
import { parentProfiles } from "@/db/schema";
import { parentPinUnlockSchema } from "@/domain/parent-pin";
import { apiJson } from "@/lib/api-response";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { grantParentGate } from "@/modules/family/parent-gate";
import { verifyPin } from "@/modules/family/pin";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
  const parsed = parentPinUnlockSchema.safeParse(body?.pin);
  if (!parsed.success) {
    return apiJson({ code: "INVALID_PARENT_PIN", message: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const [parent, systemSettings] = await Promise.all([
    getOrCreateParentProfile(authResult.session.user.id, authResult.session.user.name),
    getOperationalSystemSettings(),
  ]);
  if (!parent.pinHash) {
    return apiJson(
      { code: "PIN_SETUP_REQUIRED", message: "Ba/mẹ cần tạo mã PIN trước khi tiếp tục." },
      { status: 409 },
    );
  }
  if (parent.pinLockedUntil && parent.pinLockedUntil > new Date()) {
    return apiJson(
      { message: "Khu vực phụ huynh đang tạm khóa. Ba/mẹ thử lại sau vài phút." },
      { status: 429 },
    );
  }

  const valid = await verifyPin(parsed.data, parent.pinHash);
  if (!valid) {
    const attempts = parent.pinFailedAttempts + 1;
    const locked = attempts >= systemSettings.security.parentGateMaxAttempts;
    await db
      .update(parentProfiles)
      .set({
        pinFailedAttempts: locked ? 0 : attempts,
        pinLockedUntil: locked
          ? new Date(Date.now() + systemSettings.security.parentGateLockMinutes * 60_000)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(parentProfiles.id, parent.id));
    return apiJson(
      {
        message: locked
          ? "Ba/mẹ đã thử nhiều lần. Khu vực được tạm khóa để bảo vệ dữ liệu."
          : "Mã PIN chưa đúng, ba/mẹ thử lại nhé.",
      },
      { status: locked ? 429 : 400 },
    );
  }

  await db
    .update(parentProfiles)
    .set({ pinFailedAttempts: 0, pinLockedUntil: null, updatedAt: new Date() })
    .where(eq(parentProfiles.id, parent.id));
  await grantParentGate(parent.id);
  return apiJson({ ok: true });
}
