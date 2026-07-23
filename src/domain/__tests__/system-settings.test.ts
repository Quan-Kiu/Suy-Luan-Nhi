import { describe, expect, it } from "vitest";
import {
  managedSystemSettingDefinitions,
  parseManagedSystemSetting,
  resolveOperationalSystemSettings,
} from "@/domain/system-settings";

describe("system settings", () => {
  it("provides safe operational defaults", () => {
    const settings = resolveOperationalSystemSettings([]);

    expect(settings.maintenance.enabled).toBe(false);
    expect(settings.features.registrationEnabled).toBe(true);
    expect(settings.features.socialLoginEnabled).toBe(true);
    expect(settings.features.parentResourcesEnabled).toBe(true);
    expect(settings.features.feedbackEnabled).toBe(true);
    expect(settings.limits.maxChildProfiles).toBe(6);
    expect(settings.limits.feedbackMaxAttachments).toBe(5);
    expect(settings.security).toEqual({
      parentGateMaxAttempts: 5,
      parentGateLockMinutes: 5,
      parentGateSessionMinutes: 30,
    });
  });

  it("uses valid stored values and falls back from invalid values", () => {
    const settings = resolveOperationalSystemSettings([
      { key: "maintenance.enabled", value: true },
      { key: "maintenance.title", value: "Đang nâng cấp" },
      { key: "features.socialLoginEnabled", value: false },
      { key: "limits.maxChildProfiles", value: 99 },
      { key: "security.parentGateLockMinutes", value: 15 },
    ]);

    expect(settings.maintenance.enabled).toBe(true);
    expect(settings.maintenance.title).toBe("Đang nâng cấp");
    expect(settings.features.socialLoginEnabled).toBe(false);
    expect(settings.limits.maxChildProfiles).toBe(6);
    expect(settings.security.parentGateLockMinutes).toBe(15);
  });

  it("rejects unknown keys and out-of-range values", () => {
    expect(parseManagedSystemSetting("secrets.smtpPassword", "secret")).toBeNull();
    expect(parseManagedSystemSetting("security.parentGateMaxAttempts", 2)?.success).toBe(false);
    expect(
      (managedSystemSettingDefinitions as readonly { key: string }[]).some(
        (item) => item.key === "content.reviewRequired",
      ),
    ).toBe(false);
  });
});
