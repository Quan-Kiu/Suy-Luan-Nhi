import type { AdminParentPinResetInput, AdminPasswordResetInput } from "@/domain/admin-account-reset";
import { apiRequest } from "@/lib/api/client";

type ResetResult = {
  accepted: true;
  duplicate: boolean;
  mode: string;
  revokedSessionCount?: number;
};

function operationHeaders() {
  return { "Idempotency-Key": crypto.randomUUID() };
}

export const membersApi = {
  update(memberId: string, input: Record<string, unknown>) {
    return apiRequest({ url: `/api/admin/members/${memberId}`, method: "PATCH", data: input });
  },
  trash(memberId: string, reason?: string) {
    return apiRequest({
      url: `/api/admin/members/${memberId}`,
      method: "DELETE",
      data: reason ? { reason } : {},
    });
  },
  restore(memberId: string) {
    return apiRequest({ url: `/api/admin/members/${memberId}/restore`, method: "POST" });
  },
  permanentDelete(memberId: string) {
    return apiRequest({ url: `/api/admin/members/${memberId}/permanent`, method: "DELETE" });
  },
  resetPassword(memberId: string, input: AdminPasswordResetInput) {
    return apiRequest<ResetResult>({
      url: `/api/admin/members/${memberId}/password-reset`,
      method: "POST",
      headers: operationHeaders(),
      data: input,
    });
  },
  resetParentPin(memberId: string, input: AdminParentPinResetInput) {
    return apiRequest<ResetResult>({
      url: `/api/admin/members/${memberId}/pin-reset`,
      method: "POST",
      headers: operationHeaders(),
      data: input,
    });
  },
};
