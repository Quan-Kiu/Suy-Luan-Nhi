export const EMAIL_VERIFICATION_RESULT_PATH = "/auth/verify-email";
export const DEFAULT_VERIFICATION_CONTINUE_PATH = "/profiles";

export type EmailVerificationResult = "success" | "expired" | "invalid" | "error";

export function resolveVerificationContinuePath(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.startsWith(EMAIL_VERIFICATION_RESULT_PATH)
  ) {
    return DEFAULT_VERIFICATION_CONTINUE_PATH;
  }

  return candidate;
}
export function buildEmailVerificationCallback(continueTo = DEFAULT_VERIFICATION_CONTINUE_PATH) {
  const safeContinuePath = resolveVerificationContinuePath(continueTo);
  return `${EMAIL_VERIFICATION_RESULT_PATH}?next=${encodeURIComponent(safeContinuePath)}`;
}

export function resolveEmailVerificationResult(
  error: string | string[] | undefined,
): EmailVerificationResult {
  const code = Array.isArray(error) ? error[0] : error;
  if (!code) return "success";
  if (code === "TOKEN_EXPIRED") return "expired";
  if (code === "INVALID_TOKEN") return "invalid";
  return "error";
}
