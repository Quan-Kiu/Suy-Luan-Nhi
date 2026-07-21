import { apiRequest } from "@/lib/api/client";

export type BadgeItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconAssetId: string | null;
  iconUrl: string;
  skillId: string | null;
  skillTitle: string | null;
  active: boolean;
  missionCount: number;
  earnedCount: number;
};

export type BadgeCreateInput = {
  slug: string;
  name: string;
  description: string;
  iconUrl: string;
  skillId: string | null;
};

export type BadgeUpdateInput = Omit<BadgeCreateInput, "slug"> & { active: boolean };

export const badgesApi = {
  list() {
    return apiRequest<BadgeItem[]>({ url: "/api/admin/badges", method: "GET" });
  },
  create(input: BadgeCreateInput) {
    return apiRequest({ url: "/api/admin/badges", method: "POST", data: input });
  },
  update(badgeId: string, input: BadgeUpdateInput) {
    return apiRequest({ url: `/api/admin/badges/${badgeId}`, method: "PATCH", data: input });
  },
};
