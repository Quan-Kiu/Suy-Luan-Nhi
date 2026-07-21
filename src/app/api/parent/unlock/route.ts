import { apiJson } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { requireApiRoles } from "@/auth/api";
import { db } from "@/db/client";
import { parentProfiles } from "@/db/schema";
import { getOrCreateParentProfile } from "@/modules/family/family";
import { verifyParentMathChallenge } from "@/modules/family/parent-challenge";
import { grantParentGate } from "@/modules/family/parent-gate";
import { verifyPin } from "@/modules/family/pin";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;
  const body = (await request.json().catch(() => null)) as {
    answer?: unknown;
    method?: unknown;
    challengeToken?: unknown;
  } | null;
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  const method = body?.method === "pin" || body?.method === "math" ? body.method : null;
  const challengeToken = typeof body?.challengeToken === "string" ? body.challengeToken : "";
  if (!answer || !method) {
    return apiJson({ message: "Thiếu phương thức hoặc câu trả lời xác nhận" }, { status: 400 });
  }
  const [parent, systemSettings] = await Promise.all([
    getOrCreateParentProfile(authResult.session.user.id, authResult.session.user.name),
    getOperationalSystemSettings(),
  ]);
  if (parent.pinLockedUntil && parent.pinLockedUntil > new Date()) {
    return apiJson(
      { message: "Khu vực phụ huynh đang tạm khóa. Ba/mẹ thử lại sau vài phút." },
      { status: 429 },
    );
  }

  const valid =
    method === "pin"
      ? Boolean(parent.pinHash) && (await verifyPin(answer, parent.pinHash!))
      : verifyParentMathChallenge(challengeToken, answer);
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
          : "Câu trả lời chưa đúng, ba/mẹ thử lại nhé.",
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
