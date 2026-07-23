import { requireApiRoles } from "@/auth/api";
import { apiJson } from "@/lib/api-response";
import { ParentPinNotConfiguredError, requestParentPinReset } from "@/modules/family/pin-reset";
import { consumePinResetRequestRateLimit } from "@/modules/family/pin-reset-rate-limit";

export async function POST(request: Request) {
  const authResult = await requireApiRoles(request, ["parent", "super_admin"]);
  if ("error" in authResult) return authResult.error;

  if (!(await consumePinResetRequestRateLimit(authResult.session.user.id))) {
    return apiJson(
      { code: "PIN_RESET_RATE_LIMITED", message: "Ba/mẹ vừa yêu cầu nhiều lần. Hãy thử lại sau 15 phút." },
      { status: 429 },
    );
  }

  try {
    await requestParentPinReset({
      userId: authResult.session.user.id,
      parentName: authResult.session.user.name,
      email: authResult.session.user.email,
    });
    return apiJson({ sent: true });
  } catch (error) {
    if (error instanceof ParentPinNotConfiguredError) {
      return apiJson({ code: "PIN_SETUP_REQUIRED", message: error.message }, { status: 409 });
    }
    throw error;
  }
}
