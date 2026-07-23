import type { AgeGroup } from "@/domain/age-groups";
import { apiRequest } from "@/lib/api/client";

export type WorldStatus = "draft" | "published" | "archived";
export type WorldInput = {
  slug?: string;
  title: string;
  subtitle: string;
  description: string;
  sortOrder: number;
  themeColor: string;
  coverUrl: string;
  ageGroups: AgeGroup[];
  status?: WorldStatus;
};

export const worldsApi = {
  create(input: WorldInput) {
    return apiRequest({ url: "/api/admin/worlds", method: "POST", data: input });
  },
  update(worldId: string, input: WorldInput) {
    return apiRequest({ url: `/api/admin/worlds/${worldId}`, method: "PATCH", data: input });
  },
};
