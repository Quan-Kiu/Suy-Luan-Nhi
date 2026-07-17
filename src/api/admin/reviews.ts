import { apiRequest } from "@/lib/api/client";

function versionUrl(missionId: string, versionId: string, action: string) {
  return `/api/admin/missions/${missionId}/versions/${versionId}/${action}`;
}

export const reviewsApi = {
  decide(missionId: string, versionId: string, action: "approve" | "reject", comment: string) {
    return apiRequest({ url: versionUrl(missionId, versionId, action), method: "POST", data: { comment } });
  },
  publish(missionId: string, versionId: string) {
    return apiRequest({ url: versionUrl(missionId, versionId, "publish"), method: "POST" });
  },
  schedule(missionId: string, versionId: string, scheduledFor: string) {
    return apiRequest({
      url: versionUrl(missionId, versionId, "schedule"),
      method: "POST",
      data: { scheduledFor },
    });
  },
};
