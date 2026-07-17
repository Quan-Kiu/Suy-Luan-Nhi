import { apiRequest } from "@/lib/api/client";

export const taxonomyApi = {
  updateAgeGroup(code: string, input: Record<string, unknown>) {
    return apiRequest({ url: `/api/admin/age-groups/${code}`, method: "PATCH", data: input });
  },
  createSkill(input: Record<string, unknown>) {
    return apiRequest({ url: "/api/admin/skills", method: "POST", data: input });
  },
  updateSkill(skillId: string, input: Record<string, unknown>) {
    return apiRequest({ url: `/api/admin/skills/${skillId}`, method: "PATCH", data: input });
  },
};
