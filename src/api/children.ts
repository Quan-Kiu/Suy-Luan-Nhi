import { apiRequest } from "@/lib/api/client";
import type { CreateChildProfileInput } from "@/domain/schemas";

export type ChildSummary = {
  id: string;
  displayName: string;
  ageGroup: "2-3" | "4-5" | "6-8";
};

export const childrenApi = {
  create(input: CreateChildProfileInput) {
    return apiRequest<ChildSummary>({ url: "/api/children", method: "POST", data: input });
  },
  update(childId: string, input: Pick<ChildSummary, "displayName" | "ageGroup">) {
    return apiRequest<ChildSummary>({ url: `/api/children/${childId}`, method: "PATCH", data: input });
  },
  select(childId: string) {
    return apiRequest({ url: `/api/children/${childId}/select`, method: "POST" });
  },
  remove(childId: string) {
    return apiRequest({ url: `/api/children/${childId}`, method: "DELETE" });
  },
  resetProgress(childId: string) {
    return apiRequest({ url: `/api/children/${childId}/reset-progress`, method: "POST" });
  },
};
