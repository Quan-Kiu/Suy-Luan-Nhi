"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/auth/client";
import { contentText, useContent } from "@/content/client";
import { getAuthErrorMessage, toAuthFlowError } from "@/features/auth/auth-errors";

export function useVerificationResend(email: string, callbackURL = "/profiles") {
  const content = useContent("auth");
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL,
        fetchOptions: { credentials: "omit" },
      });
      if (result.error) throw toAuthFlowError(result.error, "VERIFICATION_SEND_FAILED");
      return result.data;
    },
  });

  return {
    resend: () => mutation.mutate(),
    pending: mutation.isPending,
    status: mutation.isSuccess
      ? ("success" as const)
      : mutation.isError
        ? ("error" as const)
        : ("idle" as const),
    message: mutation.isSuccess
      ? contentText(
          content,
          "verification.sent",
          "Email xác minh đã được gửi. Hãy kiểm tra cả thư rác nếu chưa thấy.",
        )
      : mutation.isError
        ? getAuthErrorMessage(content, mutation.error, "VERIFICATION_SEND_FAILED")
        : undefined,
    reset: mutation.reset,
  };
}
