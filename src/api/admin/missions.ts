import type { AdminMissionDraft } from "@/modules/admin/schemas";
import { apiRequest } from "@/lib/api/client";

export type AdminMissionListFilters = {
  status?: string;
  worldId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AdminMissionListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  status: "draft" | "in_review" | "rejected" | "approved" | "published" | "archived";
  difficulty: number;
  estimatedMinutes: number;
  coverUrl: string;
  currentDraftVersion: number;
  publishedAt: string | null;
  scheduledFor: string | null;
  archivedAt: string | null;
  updatedAt: string;
  worldId: string;
  worldTitle: string;
  primarySkillTitle: string;
  questionCount: number;
};
export type AdminMissionPage = {
  items: AdminMissionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminMissionVersionSummary = {
  id: string;
  versionNumber: number;
  status: AdminMissionListItem["status"];
  reviewComment: string | null;
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
};

function missionListQuery(filters: AdminMissionListFilters) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.worldId) params.set("worldId", filters.worldId);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const query = params.toString();
  return query ? `/api/admin/missions?${query}` : "/api/admin/missions";
}

export const adminMissionsApi = {
  list(filters: AdminMissionListFilters = {}) {
    return apiRequest<AdminMissionPage>({ url: missionListQuery(filters), method: "GET" });
  },
  saveDraft(missionId: string | undefined, input: AdminMissionDraft) {
    return apiRequest<{ id: string }>({
      url: missionId ? `/api/admin/missions/${missionId}` : "/api/admin/missions",
      method: missionId ? "PATCH" : "POST",
      data: input,
    });
  },
  submit(missionId: string) {
    return apiRequest({ url: `/api/admin/missions/${missionId}/submit`, method: "POST" });
  },
  restoreVersion(missionId: string, versionId: string) {
    return apiRequest<{
      mission: { id: string; status: string };
      draft: AdminMissionDraft;
      versionNumber: number;
    }>({
      url: `/api/admin/missions/${missionId}/versions/${versionId}/restore`,
      method: "POST",
    });
  },
  duplicate(missionId: string) {
    return apiRequest<{ id: string }>({
      url: `/api/admin/missions/${missionId}/duplicate`,
      method: "POST",
    });
  },
  archive(missionId: string) {
    return apiRequest({ url: `/api/admin/missions/${missionId}/archive`, method: "POST" });
  },
  restore(missionId: string) {
    return apiRequest({ url: `/api/admin/missions/${missionId}/restore`, method: "POST" });
  },
};
