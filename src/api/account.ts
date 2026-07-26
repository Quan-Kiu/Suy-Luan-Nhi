import { apiRequest } from "@/lib/api/client";
import type { ForcedPasswordChangeInput } from "@/domain/admin-account-reset";

export const accountApi = {
  completeTemporaryPassword(input: ForcedPasswordChangeInput) {
    return apiRequest<{ changed: boolean; alreadyCompleted: boolean; revokedSessionCount?: number }>({
      url: "/api/account/complete-temporary-password",
      method: "POST",
      data: input,
    });
  },
};
