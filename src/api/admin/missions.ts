import type { AdminMissionDraft } from "@/modules/admin/schemas";
import { apiRequest } from "@/lib/api/client";

export const adminMissionsApi = {
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
  duplicate(missionId: string) {
    return apiRequest<{ id: string }>({
      url: `/api/admin/missions/${missionId}/duplicate`,
      method: "POST",
    });
  },
  archive(missionId: string) {
    return apiRequest({ url: `/api/admin/missions/${missionId}/archive`, method: "POST" });
  },
};
