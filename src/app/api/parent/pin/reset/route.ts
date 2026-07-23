import { parentPinResetSchema } from "@/domain/parent-pin";
import { apiJson } from "@/lib/api-response";
import { InvalidParentPinResetTokenError, resetParentPin } from "@/modules/family/pin-reset";
import { consumePinResetAttemptRateLimit } from "@/modules/family/pin-reset-rate-limit";

export async function POST(request: Request) {
  if (!(await consumePinResetAttemptRateLimit(request))) {
    return apiJson(
      { code: "PIN_RESET_RATE_LIMITED", message: "Có quá nhiều lần thử. Hãy thử lại sau 15 phút." },
      { status: 429 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = parentPinResetSchema.safeParse(body);
  if (!parsed.success) {
    return apiJson(
      { code: "INVALID_PARENT_PIN_RESET", message: parsed.error.issues[0]?.message },
      { status: 400 },
    );
  }

  try {
    await resetParentPin(parsed.data.token, parsed.data.pin);
    return apiJson({ reset: true });
  } catch (error) {
    if (error instanceof InvalidParentPinResetTokenError) {
      return apiJson({ code: "INVALID_PIN_RESET_TOKEN", message: error.message }, { status: 400 });
    }
    throw error;
  }
}
