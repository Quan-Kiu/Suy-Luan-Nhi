import type { AccountSecurityOverview } from "@/domain/account-security";
import { apiRequest } from "@/lib/api/client";

export const accountSecurityApi = {
  getOverview() {
    return apiRequest<AccountSecurityOverview>({ url: "/api/account/security", method: "GET" });
  },
  revokeSession(sessionId: string) {
    return apiRequest<AccountSecurityOverview>({
      url: `/api/account/security/sessions/${sessionId}`,
      method: "DELETE",
    });
  },
  revokeOtherSessions() {
    return apiRequest<AccountSecurityOverview>({
      url: "/api/account/security/sessions/revoke-others",
      method: "POST",
    });
  },
};
