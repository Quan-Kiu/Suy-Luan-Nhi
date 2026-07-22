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
  currentRank: string;
  status: "active" | "pending_deletion";
  deletionRequestedAt: string | null;
};

export type DeletedChildProfile = ChildProfile & {
  status: "pending_deletion";
  deletionRequestedAt: string;
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
    return apiRequest<DeletedChildProfile>({ url: `/api/children/${childId}`, method: "DELETE" });
  },
  restore(childId: string) {
    return apiRequest<ChildProfile>({ url: `/api/children/${childId}/restore`, method: "POST" });
  },
  removePermanently(childId: string) {
    return apiRequest<{ deleted: true; childId: string }>({
      url: `/api/children/${childId}/permanent`,
      method: "DELETE",
    });
  },
};
