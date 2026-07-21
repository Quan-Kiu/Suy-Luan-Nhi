import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export async function getSystemFeedbackRuntimeSettings() {
  const settings = await getOperationalSystemSettings();
  return {
    enabled: settings.features.feedbackEnabled,
    maxAttachments: settings.limits.feedbackMaxAttachments,
  };
}
