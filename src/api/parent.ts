import { apiRequest } from "@/lib/api/client";

export type ParentSettingsInput = {
  soundEnabled: boolean;
  effectsEnabled: boolean;
  notificationSettings: Record<string, boolean>;
  privacySettings: Record<string, boolean>;
  pin?: string;
};

export const parentApi = {
  updateSettings(input: ParentSettingsInput) {
    return apiRequest<{ updated: true }>({ url: "/api/parent/settings", method: "PATCH", data: input });
  },
  requestExport() {
    return apiRequest<{ downloadUrl: string }>({ url: "/api/parent/export-data", method: "POST" });
  },
  requestDeletion() {
    return apiRequest({ url: "/api/parent/delete-data-request", method: "POST" });
  },
  setupPin(input: { pin: string }) {
    return apiRequest({ url: "/api/parent/pin", method: "POST", data: input });
  },
  unlock(input: { pin: string }) {
    return apiRequest({ url: "/api/parent/unlock", method: "POST", data: input });
  },
  requestPinReset() {
    return apiRequest<{ sent: true }>({ url: "/api/parent/pin/reset-request", method: "POST" });
  },
  resetPin(input: { token: string; pin: string; confirmPin: string }) {
    return apiRequest<{ reset: true }>({ url: "/api/parent/pin/reset", method: "POST", data: input });
  },
  getDashboard() {
    return apiRequest({ url: "/api/parent/dashboard", method: "GET" });
  },
  markNotificationRead(notificationId: string) {
    return apiRequest({ url: `/api/parent/notifications/${notificationId}/read`, method: "POST" });
  },
};
