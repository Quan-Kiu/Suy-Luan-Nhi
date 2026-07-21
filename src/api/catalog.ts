import type { MissionMapData } from "@/features/catalog/mission-map-types";
import { apiRequest } from "@/lib/api/client";

export const catalogApi = {
  getMissionMap(childId: string) {
    return apiRequest<MissionMapData>({
      url: `/api/children/${childId}/mission-map`,
      method: "GET",
    });
  },
};
