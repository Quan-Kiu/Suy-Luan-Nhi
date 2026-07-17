import { apiRequest } from "@/lib/api/client";

export const membersApi = {
  update(memberId: string, input: Record<string, unknown>) {
    return apiRequest({ url: `/api/admin/members/${memberId}`, method: "PATCH", data: input });
  },
};
