import { apiRequest } from "@/lib/api/client";

export const dataRequestsApi = {
  process(requestId: string) {
    return apiRequest({ url: `/api/admin/data-requests/${requestId}/process`, method: "POST" });
  },
};
