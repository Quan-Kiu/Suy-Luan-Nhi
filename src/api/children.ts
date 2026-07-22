import type { CreateChildProfileInput } from "@/domain/schemas";
import { apiRequest } from "@/lib/api/client";

export type ChildSummary = {
  id: string;
  displayName: string;
  ageGroup: "6-8" | "9-10" | "11-12";
};

export type ChildProfile = ChildSummary & {
  avatarAssetId: string | null;
  avatarUrl: string;
};

export type UpdateChildInput = Pick<ChildProfile, "displayName" | "ageGroup"> & {
  avatarAssetId: string;
};

export const childrenApi = {
  create(input: CreateChildProfileInput) {
    return apiRequest<ChildProfile>({ url: "/api/children", method: "POST", data: input });
  },
  update(childId: string, input: UpdateChildInput) {
    return apiRequest<ChildProfile>({ url: `/api/children/${childId}`, method: "PATCH", data: input });
  },
  select(childId: string) {
    return apiRequest<{ selectedChildId: string }>({
      url: `/api/children/${childId}/select`,
      method: "POST",
    });
  },
  resetProgress(childId: string) {
    return apiRequest<{ ok: true }>({
      url: `/api/children/${childId}/reset-progress`,
      method: "POST",
    });
  },
  remove(childId: string) {
    return apiRequest<{ deleted: true }>({ url: `/api/children/${childId}`, method: "DELETE" });
  },
};
