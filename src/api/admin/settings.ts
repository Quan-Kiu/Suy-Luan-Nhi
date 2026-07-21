import { apiRequest } from "@/lib/api/client";

export type SystemSetting = {
  key: string;
  value: unknown;
  updatedAt: Date | string | null;
  source?: "default" | "saved";
};

export const systemSettingsApi = {
  save(key: string, value: unknown) {
    return apiRequest<SystemSetting>({
      url: "/api/admin/settings",
      method: "PATCH",
      data: { key, value },
    });
  },
};
